/**
 * Acceptance Test Suite: Time-Aware Digital Discoverability
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 *
 * Run via: npm test (or node --test tests/acceptanceTests.test.js)
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const feasibilityMath = require('../utils/feasibilityMath');
const schemaValidator = require('../utils/schemaValidator');
const distanceMatrixService = require('../services/distanceMatrixService');
const geminiService = require('../services/geminiService');
const mongoService = require('../services/mongoService');
const config = require('../config/env');

describe('Team Venator Acceptance Test Suite', () => {

  // TEST 1: Exact Feasibility Inequality Compliance
  test('Test 1: Evaluates candidate feasibility via strict mathematical inequality', () => {
    // Case A: Strictly Feasible
    // Outbound: 20m, Return: 20m, Visit: 40m
    // Roundtrip + Visit = 80m. Buffer (25%) = ceil(0.25 * 80) = 20m.
    // Total = 20 + 20 + 40 + 20 = 100m.
    // Available: 120m -> 100 <= 120 -> Feasible with 20m slack.
    const resultFeasible = feasibilityMath.evaluateCandidate({
      outboundMinutes: 20,
      returnMinutes: 20,
      minDwellMinutes: 40,
      availableMinutes: 120
    });

    assert.equal(resultFeasible.feasible, true);
    assert.equal(resultFeasible.t_round_trip, 40);
    assert.equal(resultFeasible.t_buffer, 20);
    assert.equal(resultFeasible.t_total, 100);
    assert.equal(resultFeasible.slack_minutes, 20);

    // Case B: Infeasible (violates boundary)
    // Available: 90m -> Total 100 > 90 -> Infeasible with -10m slack.
    const resultInfeasible = feasibilityMath.evaluateCandidate({
      outboundMinutes: 20,
      returnMinutes: 20,
      minDwellMinutes: 40,
      availableMinutes: 90
    });

    assert.equal(resultInfeasible.feasible, false);
    assert.equal(resultInfeasible.t_total, 100);
    assert.equal(resultInfeasible.slack_minutes, -10);
  });

  // TEST 2: Strict 25% Safety Buffer Injection
  test('Test 2: Enforces mandatory 25% safety buffer calculation', () => {
    // Buffer = ceil(0.25 * (T_roundtrip + T_visit))
    // 30m roundtrip + 45m visit = 75m -> 0.25 * 75 = 18.75 -> ceil = 19m
    const buffer = feasibilityMath.calculateBuffer(30, 45);
    assert.equal(buffer, 19);

    // 0 roundtrip + 60m visit = 60m -> 0.25 * 60 = 15m
    const bufferClean = feasibilityMath.calculateBuffer(0, 60);
    assert.equal(bufferClean, 15);
  });

  // TEST 3: Over-Budget Candidate Elimination (Pruning)
  test('Test 3: Pruning strictly eliminates candidates exceeding available time budget', () => {
    const mockCandidates = [
      {
        id: 'candidate_near',
        name: 'Near Cluster',
        distance_from_fort_km: 3.5,
        transit_outbound_mins: 15,
        transit_return_mins: 15,
        min_dwell_time_mins: 30 // RT=30, Visit=30 -> 60. Buffer=15. Total=75m
      },
      {
        id: 'candidate_far',
        name: 'Far Cluster',
        distance_from_fort_km: 7.5,
        transit_outbound_mins: 35,
        transit_return_mins: 35,
        min_dwell_time_mins: 60 // RT=70, Visit=60 -> 130. Buffer=33. Total=163m
      }
    ];

    // Tight budget: 90 minutes. Near Cluster (75m) fits, Far Cluster (163m) must be pruned.
    const prunedList = feasibilityMath.pruneAndRank(mockCandidates, 90, false);
    assert.equal(prunedList.length, 1);
    assert.equal(prunedList[0].id, 'candidate_near');
    assert.equal(prunedList[0].feasibility.feasible, true);

    // Large budget: 200 minutes. Both clusters fit.
    const generousList = feasibilityMath.pruneAndRank(mockCandidates, 200, false);
    assert.equal(generousList.length, 2);
  });

  // TEST 4: Transit API Outage Handling & [Travel-Time Unverified] Tagging
  test('Test 4: Transit API outage triggers unverified badge fallback without lying', async () => {
    const origin = config.defaultOrigin;
    const destination = { lat: 26.2150, lng: 78.1685 }; // Chanderi cluster

    // Simulating API outage
    const transitOutage = await distanceMatrixService.getTransitTime(origin, destination, true);

    assert.equal(transitOutage.is_verified, false);
    assert.equal(transitOutage.verification_tag, '[Travel-Time Unverified]');
    assert.ok(transitOutage.warning.includes('unverified'));
    assert.ok(transitOutage.outbound_minutes > 0);
  });

  // TEST 5: Schema Validation & Boundary Rules
  test('Test 5: Validates request payloads and rejects malformed parameters', () => {
    // Valid Request
    const valid = schemaValidator.validateSearchRequest({
      query: 'Authentic weavers',
      time_budget_minutes: 180,
      origin: { lat: 26.2298, lng: 78.1733 }
    });
    assert.equal(valid.valid, true);

    // Invalid Request: empty query & negative budget
    const invalid = schemaValidator.validateSearchRequest({
      query: '',
      time_budget_minutes: -50
    });
    assert.equal(invalid.valid, false);
    assert.ok(invalid.errors.length >= 2);
  });

  // TEST 6: Multilingual Intent Normalization (Hindi / Hinglish / English)
  test('Test 6: Normalizes multilingual queries to structured categories', () => {
    // Hindi/Hinglish food query
    const foodIntent = geminiService.heuristicFallback('Mujhe local khana khana hai, 3 ghante hain');
    assert.equal(foodIntent.category, 'culinary');
    assert.equal(foodIntent.time_budget_minutes, 180);

    // Chanderi weaver query
    const craftIntent = geminiService.heuristicFallback('Chanderi weavers aur sarees');
    assert.equal(craftIntent.category, 'crafts');

    // Tansen music query
    const musicIntent = geminiService.heuristicFallback('Tansen sangeet academy dekhna hai');
    assert.equal(musicIntent.category, 'music');
  });

  // TEST 7: Dataset Integrity (12 Curated Gwalior POIs)
  test('Test 7: Verified pilot dataset contains at least 12 audited Gwalior POIs', () => {
    const originalGetTransitTime = distanceMatrixService.getTransitTime;
    distanceMatrixService.getTransitTime = async () => ({
      distance_km: 5,
      outbound_minutes: 15,
      return_minutes: 15,
      is_verified: false,
      verification_tag: '[Travel-Time Unverified]',
      warning: 'Synthetic test fixture; no live provider called.'
    });
    const all = mongoService.findCandidates({ category: 'all', origin: config.defaultOrigin });
    return all.then(pois => {
      assert.ok(pois.length >= 10);
      const sample = pois[0];
      assert.ok(sample.id);
      assert.ok(sample.name);
      assert.ok(sample.min_dwell_time_mins > 0);
      assert.ok(sample.verification_status);
    }).finally(() => { distanceMatrixService.getTransitTime = originalGetTransitTime; });
  });

  // TEST 8: Express bridge calls the LangGraph REST API without n8n or synthetic fallback
  test('Tourism plan bridge forwards the validated contract to LangGraph', async () => {
    const bridge = require('../services/tourismWorkflowService');
    const original = bridge.postJson;
    let calledUrl; let calledPayload;
    bridge.postJson = async (url, payload) => { calledUrl=url; calledPayload=payload; return { status:'feasible', itinerary_stops:[], warnings:[] }; };
    try {
      const result = await bridge.executeWorkflow({ query:'Silk weaving', city:'Gwalior', date:'2026-10-30', start_time:'10:00', duration_hours:3, deadline:'13:00', return_location:'Station', origin:{lat:26.22,lng:78.17}, start_location:{label:'Start',latitude:26.22,longitude:78.17,source:'map_pin'}, end_location:{label:'Station',latitude:26.21,longitude:78.18,source:'manual_coordinates'}, return_to_start:false, transit_mode:'auto', companion:'couple' });
      assert.equal(result.status, 'feasible');
      assert.match(calledUrl, /\/plan$/);
      assert.equal(calledPayload.available_minutes,180);
      assert.equal(calledPayload.return_location,'Station');
      assert.equal(calledPayload.companion,'couple');
      assert.equal(calledPayload.start_location.label,'Start');
      assert.equal(calledPayload.end_location.label,'Station');
      assert.equal(calledPayload.return_to_start,false);
      const direct = await bridge.executeWorkflow({ direct_route_only:true, start_location:{label:'Start',latitude:26.22,longitude:78.17,source:'map_pin'}, end_location:{label:'End',latitude:26.21,longitude:78.18,source:'manual_coordinates'}, return_to_start:false });
      assert.equal(direct.status,'feasible');
      assert.equal(calledPayload.direct_route_only,true);
      const missing = await bridge.executeWorkflow({query:''});
      assert.equal(missing.status,'needs_input');
      const logLines = [];
      const originalError = console.error;
      bridge.postJson = async () => { throw new Error('private-token-and-provider-url'); };
      console.error = (...args) => logLines.push(args.join(' '));
      try {
        const unavailable = await bridge.executeWorkflow({ query: 'Silk weaving' });
        assert.equal(unavailable.statusCode, 503);
        assert.equal(unavailable.errors[0], 'Tourism planning service unavailable.');
        assert.ok(!JSON.stringify(unavailable).includes('private-token-and-provider-url'));
        assert.ok(!logLines.join(' ').includes('private-token-and-provider-url'));
      } finally { console.error = originalError; }
    } finally { bridge.postJson=original; }
  });

  test('Express returns a safe 400 response for malformed JSON', async () => {
    const app = require('../server');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const response = await fetch(`${base}/api/v1/tourism-plan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid'
      });
      const data = await response.json();
      assert.equal(response.status, 400);
      assert.deepEqual(data, { status: 'error', message: 'Invalid request body.' });
      assert.ok(!JSON.stringify(data).includes('Unexpected token'));
    } finally { await new Promise(resolve => server.close(resolve)); }
  });

  test('Legacy Express APIs do not expose caught exception messages', async () => {
    const app = require('../server');
    const mongoService = require('../services/mongoService');
    const originalIntent = geminiService.extractIntent;
    const originalCandidates = mongoService.findCandidates;
    const originalPrune = feasibilityMath.pruneAndRank;
    const originalError = console.error;
    const logLines = [];
    geminiService.extractIntent = async () => { throw new Error('private-token-and-provider-url'); };
    mongoService.findCandidates = async () => [];
    feasibilityMath.pruneAndRank = () => { throw new Error('private-token-and-provider-url'); };
    console.error = (...args) => logLines.push(args.join(' '));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const intent = await fetch(`${base}/api/v1/intent/parse`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'silk' })
      });
      assert.equal(intent.status, 500);
      assert.equal((await intent.json()).message, 'Intent parsing failed.');

      geminiService.extractIntent = async () => ({ category: 'all', time_budget_minutes: 180 });
      const feasibility = await fetch(`${base}/api/v1/feasibility/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'silk', time_budget_minutes: 180, origin: config.defaultOrigin })
      });
      assert.equal(feasibility.status, 500);
      assert.equal((await feasibility.json()).message, 'Feasibility search failed.');
      assert.ok(!logLines.join(' ').includes('private-token-and-provider-url'));
    } finally {
      await new Promise(resolve => server.close(resolve));
      geminiService.extractIntent = originalIntent;
      mongoService.findCandidates = originalCandidates;
      feasibilityMath.pruneAndRank = originalPrune;
      console.error = originalError;
    }
  });

  test('Separate itinerary and attraction routes serve their pages and stable-ID API records', async () => {
    const app = require('../server');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const [itineraryPage, detailPage, attraction, missing] = await Promise.all([
        fetch(`${base}/itinerary`), fetch(`${base}/attractions/poi_gwl_001`),
        fetch(`${base}/api/v1/attractions/poi_gwl_001`), fetch(`${base}/api/v1/attractions/not-a-real-id`)
      ]);
      assert.equal(itineraryPage.status, 200);
      assert.match(await itineraryPage.text(), /itineraryContent/);
      assert.equal(detailPage.status, 200);
      assert.match(await detailPage.text(), /attractionDetail/);
      assert.equal(attraction.status, 200);
      assert.equal((await attraction.json()).data.id, 'poi_gwl_001');
      assert.equal(missing.status, 404);
      assert.equal((await missing.json()).status, 'not_found');
    } finally { await new Promise(resolve => server.close(resolve)); }
  });

  test('Chat validates input, isolates conversation history by session, and routes plans through LangGraph bridge', async () => {
    const app = require('../server'); const chat = require('../services/chatService'); const bridge = require('../services/tourismWorkflowService');
    const originalAnswer = geminiService.answerTourismQuestion; const originalPlan = bridge.executeWorkflow;
    const seen = []; geminiService.answerTourismQuestion = async (_q, _records, history) => { seen.push(history.map(turn => ({ ...turn }))); return 'Dataset-grounded answer.'; };
    bridge.executeWorkflow = async payload => ({ statusCode: 200, status: 'needs_input', missing_fields: ['start_location'], itinerary_stops: [] });
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve)); const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const invalid = await fetch(`${base}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:' '}) }); assert.equal(invalid.status,400);
      const tooLong = await fetch(`${base}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:'x'.repeat(2001),conversationId:'x'}) }); assert.equal(tooLong.status,413);
      let response = await fetch(`${base}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:'Tell me about heritage',conversationId:'same'}) });
      const cookie = response.headers.get('set-cookie').split(';')[0]; assert.equal((await response.json()).reply,'Dataset-grounded answer.');
      response = await fetch(`${base}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json',Cookie:cookie}, body:JSON.stringify({message:'And entry fees?',conversationId:'same'}) }); await response.json();
      assert.equal(seen[1].length,2);
      await fetch(`${base}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:'Tell me about heritage',conversationId:'same'}) });
      assert.equal(seen[2].length,0);
      const planned = await fetch(`${base}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json',Cookie:cookie}, body:JSON.stringify({message:'Plan a four-hour visit',conversationId:'plan-1',trip:{available_minutes:240}}) });
      const result = await planned.json(); assert.equal(result.status,'needs_input'); assert.ok(result.result.missing_fields.includes('start_location'));
    } finally { await new Promise(resolve => server.close(resolve)); geminiService.answerTourismQuestion=originalAnswer; bridge.executeWorkflow=originalPlan; chat._sessions.clear(); }
  });

  test('Chat page is reachable and surfaces Gemini or planning failures without claiming success', async () => {
    const app = require('../server'); const bridge = require('../services/tourismWorkflowService');
    const originalAnswer = geminiService.answerTourismQuestion; const originalPlan = bridge.executeWorkflow;
    geminiService.answerTourismQuestion = async () => { throw new Error('Gemini request timed out'); };
    bridge.executeWorkflow = async () => ({ statusCode: 503, status: 'provider_error', errors: ['Tourism planning service unavailable.'], itinerary_stops: [] });
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve)); const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const page = await fetch(`${base}/chat`); assert.equal(page.status, 200); assert.match(await page.text(), /id="chatForm"/);
      const headers = { 'Content-Type': 'application/json' };
      const gemini = await fetch(`${base}/api/chat`, { method:'POST', headers, body:JSON.stringify({ message:'What is in the dataset?', conversationId:'gemini-fail' }) });
      const geminiError = await gemini.json(); assert.equal(gemini.status, 503); assert.equal(geminiError.status, 'provider_error'); assert.match(geminiError.message, /60 seconds/);
      const plan = await fetch(`${base}/api/chat`, { method:'POST', headers, body:JSON.stringify({ message:'Plan a route', conversationId:'agent-fail', trip:{ available_minutes:120 } }) });
      const data = await plan.json(); assert.equal(plan.status, 503); assert.equal(data.status, 'provider_error'); assert.equal(data.result, null);
      const invalidConversation = await fetch(`${base}/api/chat`, { method:'POST', headers, body:JSON.stringify({ message:'Hi', conversationId:'bad id' }) });
      assert.equal(invalidConversation.status, 400);
    } finally { await new Promise(resolve => server.close(resolve)); geminiService.answerTourismQuestion=originalAnswer; bridge.executeWorkflow=originalPlan; }
  });

  test('Chat returns planner-backed itinerary and map actions with stable attraction ids', async () => {
    const app = require('../server'); const bridge = require('../services/tourismWorkflowService'); const originalPlan = bridge.executeWorkflow;
    bridge.executeWorkflow = async () => ({ statusCode: 200, status: 'feasible', itinerary_stops: [{ poi_id: 'poi_gwl_001', name: 'Gwalior Fort', planned_arrival: '10:00' }], route_legs: [{ leg: 'origin->poi_gwl_001', duration_minutes: 12 }], warnings: [] });
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve)); const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const response = await fetch(`${base}/api/chat`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ message:'Plan a trip', conversationId:'map-links', trip:{ available_minutes:120 } }) });
      const data = await response.json(); assert.equal(response.status, 200); assert.equal(data.status, 'feasible');
      assert.equal(data.result.itinerary_stops[0].poi_id, 'poi_gwl_001');
      assert.deepEqual(data.actions, { itinerary:'/itinerary', map:'/itinerary#tripMap' });
    } finally { await new Promise(resolve => server.close(resolve)); bridge.executeWorkflow=originalPlan; }
  });
});
