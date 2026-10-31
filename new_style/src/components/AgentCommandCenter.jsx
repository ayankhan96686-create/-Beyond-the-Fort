import { useState } from 'react';
import {
  Cpu, Activity, CheckCircle2, AlertCircle, ArrowRight, Play,
  RefreshCw, ShieldCheck, Route, Clock, Landmark, Compass, Zap,
  Layers, Code2, Database, Terminal, Sparkles
} from 'lucide-react';
import { planItinerary } from '../services/api';

const AGENTS = [
  {
    id: 'manager',
    name: 'Manager Agent',
    title: 'Geospatial Constraints & Geocoding',
    icon: Compass,
    color: '#0284C7',
    badge: 'LangGraph Entrypoint',
    description: 'Validates spatial coordinates, parses origin/destination hubs, geocodes addresses, and establishes strict temporal geofences for Gwalior.',
    inputs: ['user_query', 'available_minutes', 'start_location', 'transport_mode'],
    outputs: ['normalized_coordinates', 'boundary_polygon', 'time_budget_sec'],
    systemPromptSnippet: 'You are the Manager Agent for Gwalior Tourism. Extract geospatial coordinates (lat/lng) and enforce strict time boundaries. Fail fast if starting location is invalid.'
  },
  {
    id: 'research',
    name: 'Research Agent',
    title: 'Curated Catalog Discovery & Filter',
    icon: Landmark,
    color: '#D97706',
    badge: 'Curated Knowledge Base',
    description: 'Inspects 57 curated heritage candidates from the official dataset. Eliminates synthetic and unverified places. Filters by day of week and operating hours.',
    inputs: ['interests', 'visitor_category', 'visit_date', 'day_of_week'],
    outputs: ['curated_candidates (top 5-10)', 'operating_windows', 'ticket_tiers'],
    systemPromptSnippet: 'Search the curated Gwalior attraction catalog. Strictly reject synthetic placeholders. Validate opening hours for the requested date.'
  },
  {
    id: 'route',
    name: 'Route & Time Agent',
    title: 'Road Network Transit Matrix',
    icon: Route,
    color: '#059669',
    badge: 'Routing & Mapbox Engine',
    description: 'Calculates real-world road network travel durations and distances between consecutive stops. Uses calibrated speed profiles for E-Rickshaws, Cabs, and Pedestrians.',
    inputs: ['origin_node', 'candidate_nodes', 'transport_mode'],
    outputs: ['distance_matrix_km', 'raw_transit_times_min', 'congestion_factor'],
    systemPromptSnippet: 'Calculate point-to-point transit times using Gwalior road topography and mode speed curves: E-Rickshaw ~18 km/h, Cab ~28 km/h, Walking ~4.2 km/h.'
  },
  {
    id: 'verification',
    name: 'Verification Agent',
    title: 'ASI Provenance & Evidence Audit',
    icon: ShieldCheck,
    color: '#7C3AED',
    badge: 'Zero-Hallucination Guard',
    description: 'Audits each proposed attraction against the Archaeological Survey of India (ASI) register, verified pricing schedules, and ground-truth accessibility data.',
    inputs: ['candidate_records', 'ticket_catalog', 'asi_monument_registry'],
    outputs: ['provenance_scores (100%)', 'verified_tariffs', 'safety_clearance'],
    systemPromptSnippet: 'Cross-check each monument against the ASI central database. Ensure coordinates match authentic gazetteer. Flag any unverifiable claim.'
  },
  {
    id: 'itinerary',
    name: 'Itinerary & Optimization Agent',
    title: '+25% Transit Buffer & Feasibility Solver',
    icon: Zap,
    color: '#C59B27',
    badge: 'Deterministic Knapsack',
    description: 'Enforces the mathematical feasibility inequality with a non-negotiable +25% transit safety buffer: T_travel + 1.25*T_transit + T_dwell <= T_budget.',
    inputs: ['verified_candidates', 'transit_matrix', 'available_time'],
    outputs: ['chronological_itinerary', 'buffer_breakdown', 'feasibility_verdict'],
    systemPromptSnippet: 'Solve the constrained itinerary knapsack. Multiply every travel leg by 1.25 for safety margin. Reject any stop combination exceeding the return deadline.'
  },
  {
    id: 'response',
    name: 'Final Response Agent',
    title: 'Synthesis & Contract Assembly',
    icon: Cpu,
    color: '#2B070C',
    badge: 'Schema Formatter',
    description: 'Assembles the complete JSON contract, timeline markers, turn-by-turn guidance, emergency contacts, and audio narration scripts.',
    inputs: ['optimized_itinerary', 'provenance_audit', 'safety_buffer_stats'],
    outputs: ['final_response_json', 'audio_guide_manifest', 'print_manifest'],
    systemPromptSnippet: 'Compile structured response following strict API schema. Include exact arrival/departure timestamps, dwell durations, and provenance tags.'
  }
];

export default function AgentCommandCenter({ onSelectItinerary }) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'sandbox' | 'provenance'
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [queryPreset, setQueryPreset] = useState('fort palaces history');
  const [hoursBudget, setHoursBudget] = useState(4);
  const [transportMode, setTransportMode] = useState('cab');

  const runLiveSimulation = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const data = await planItinerary({
        query: queryPreset,
        available_minutes: hoursBudget * 60,
        transport_mode: transportMode,
        start_location: {
          label: 'Gwalior Railway Station',
          lat: 26.2163,
          lng: 78.1972,
          source: 'map_pin'
        }
      });
      setExecutionResult(data);
    } catch (err) {
      setExecutionResult({
        status: 'error',
        message: err.message || 'Execution failed'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section id="agent-command-center" className="w-full py-16 sm:py-24 bg-[#F6F2E9] text-[#1C1617]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8DEC9] pb-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#8F690B]">
              <Cpu className="w-5 h-5 text-[#8F690B]" />
              AI Multi-Agent Systems Architecture
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2B070C] tracking-tight">
              The 6-Agent LangGraph Engine.
            </h2>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-light">
              Executed directly in-process via <code className="px-2.5 py-1 rounded-md bg-stone-200 text-[#2B070C] font-mono text-xs font-bold">LangGraph.js (:5173)</code>. Every itinerary is orchestrated through a deterministic directed graph of 6 specialized autonomous agents.
            </p>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E8DEC9] shadow-xs self-start md:self-end">
            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-[#2B070C] text-[#F3D279] shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Architecture & Graph
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sandbox')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sandbox'
                  ? 'bg-[#2B070C] text-[#F3D279] shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Play className="w-4 h-4 text-[#C59B27]" />
              Live Agent Sandbox
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('provenance')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'provenance'
                  ? 'bg-[#2B070C] text-[#F3D279] shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Provenance & Math
            </button>
          </div>
        </div>

        {/* TAB 1: ARCHITECTURE & GRAPH VIEW */}
        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: 6 Agents Grid List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
                <span>LangGraph Sequential Pipeline</span>
                <span>Click Agent for System Prompt</span>
              </div>

              {AGENTS.map((agent, index) => {
                const isSelected = selectedAgent.id === agent.id;
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-white border-[#C59B27] shadow-lg ring-2 ring-[#C59B27]/30'
                        : 'bg-white/80 hover:bg-white border-[#E8DEC9] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white"
                          style={{ backgroundColor: agent.color }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-400">
                              0{index + 1}
                            </span>
                            <h3 className="font-display text-lg font-bold text-[#2B070C]">
                              {agent.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                              {agent.badge}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 font-medium">
                            {agent.title}
                          </p>
                          <p className="text-xs text-stone-500 line-clamp-2 pt-1 font-light">
                            {agent.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-1">
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-[#C59B27] translate-x-1' : 'text-stone-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Agent Inspector Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-md space-y-6">
                
                <div className="flex items-center gap-3 border-b border-[#E8DEC9] pb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: selectedAgent.color }}
                  >
                    {(() => {
                      const Icon = selectedAgent.icon;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27]">
                      Agent Node Specification
                    </span>
                    <h3 className="font-display text-xl font-bold text-[#2B070C]">
                      {selectedAgent.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                    Core Function & Responsibility
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
                    {selectedAgent.description}
                  </p>
                </div>

                {/* State Contract: Inputs and Outputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#0284C7]" />
                      State Inputs
                    </span>
                    <ul className="text-xs font-mono text-stone-600 space-y-1">
                      {selectedAgent.inputs.map(i => (
                        <li key={i} className="truncate">• {i}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#059669]" />
                      State Outputs
                    </span>
                    <ul className="text-xs font-mono text-stone-600 space-y-1">
                      {selectedAgent.outputs.map(o => (
                        <li key={o} className="truncate">• {o}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* System Prompt Contract */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-stone-700" />
                    System Prompt Directive
                  </span>
                  <div className="p-3.5 rounded-xl bg-[#1C1617] text-stone-200 font-mono text-xs leading-relaxed border border-stone-800">
                    "{selectedAgent.systemPromptSnippet}"
                  </div>
                </div>

                {/* Direct Action */}
                <button
                  type="button"
                  onClick={() => setActiveTab('sandbox')}
                  className="w-full py-3 rounded-xl bg-[#2B070C] hover:bg-[#4A121A] text-[#F3D279] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test {selectedAgent.name} in Live Sandbox</span>
                </button>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: LIVE AGENT SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-6">
              
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-[#2B070C]">
                  Live Multi-Agent Execution Sandbox
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                  Trigger an actual LangGraph multi-agent run. Watch the 6 agents execute sequentially with real latencies, dataset lookups, and deterministic buffer calculations.
                </p>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Query / Theme
                  </label>
                  <select
                    value={queryPreset}
                    onChange={(e) => setQueryPreset(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-[#1C1617]"
                  >
                    <option value="fort palaces history">Gwalior Fort & Royal Palaces</option>
                    <option value="unesco tansen music heritage">UNESCO Music & Dhrupad Tradition</option>
                    <option value="chanderi weavers craft market">Chanderi Weavers & Bazaars</option>
                    <option value="heritage sweets and lashkar cuisine">Heritage Sweets & Local Food</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Time Budget
                  </label>
                  <select
                    value={hoursBudget}
                    onChange={(e) => setHoursBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-[#1C1617]"
                  >
                    <option value={2}>2 Hours (Express Expedition)</option>
                    <option value={4}>4 Hours (Standard Tour)</option>
                    <option value={6}>6 Hours (Deep Cultural Immersion)</option>
                    <option value={8}>8 Hours (Full Day Grand Journey)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Transport Mode
                  </label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-[#1C1617]"
                  >
                    <option value="cab">Private AC Cab (~28 km/h)</option>
                    <option value="e-rickshaw">E-Rickshaw (~18 km/h)</option>
                    <option value="walking">Walking Heritage Trail (~4.2 km/h)</option>
                  </select>
                </div>
              </div>

              {/* Fire Button */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={runLiveSimulation}
                  disabled={isExecuting}
                  className="px-6 py-3 rounded-xl bg-[#2B070C] hover:bg-[#4A121A] disabled:opacity-50 text-[#F3D279] font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-md transition-all cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#F3D279]" />
                      <span>Executing LangGraph StateGraph…</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-[#C59B27]" />
                      <span>Run 6-Agent LangGraph Pipeline</span>
                    </>
                  )}
                </button>

                <span className="text-xs text-stone-500 font-mono">
                  Endpoint: POST /api/v1/tourism-plan
                </span>
              </div>

            </div>

            {/* Execution Result Display */}
            {executionResult && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-md space-y-6 animate-fadeIn">
                
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h4 className="font-display text-xl font-bold text-[#2B070C]">
                      Workflow Telemetry & Response
                    </h4>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Status: {executionResult.status?.toUpperCase() || 'SUCCESS'}
                  </span>
                </div>

                {/* Execution Trace Timeline */}
                {executionResult.execution_trace && executionResult.execution_trace.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Agent Execution Latency Trace
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {executionResult.execution_trace.map((t, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#C59B27] uppercase">
                              Agent {idx + 1}
                            </span>
                            <span className="font-mono text-[10px] text-stone-500">
                              {t.duration_ms}ms
                            </span>
                          </div>
                          <div className="text-xs font-bold text-[#2B070C] capitalize">
                            {t.agent}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {t.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mathematical Feasibility Card */}
                {(executionResult.total_travel_minutes !== undefined || executionResult.total_day_minutes) && (() => {
                  const travel = executionResult.total_travel_minutes || 0;
                  const buffer = executionResult.safety_buffer_minutes ?? executionResult.total_transit_buffer_minutes ?? Math.round(travel * 0.25);
                  const dwell = executionResult.total_visit_minutes ?? executionResult.total_dwell_minutes ?? 0;
                  const total = executionResult.total_day_minutes ?? (travel + buffer + dwell);
                  const budget = executionResult.available_minutes || hoursBudget * 60;
                  return (
                    <div className="p-4 rounded-2xl bg-[#F6F2E9] border border-[#E8DEC9] space-y-2">
                      <span className="text-xs font-bold text-[#2B070C] uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#C59B27]" />
                        Deterministic Feasibility Formula
                      </span>
                      <div className="font-mono text-sm text-[#2B070C] font-bold">
                        {travel}m (Travel) + {buffer}m (+25% Buffer) + {dwell}m (Dwell) = {total}m ≤ {budget}m
                      </div>
                    </div>
                  );
                })()}

                {/* Stops Returned */}
                {executionResult.itinerary_stops && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Stops Returned ({executionResult.itinerary_stops.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {executionResult.itinerary_stops.map((stop, sIdx) => (
                        <div key={sIdx} className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-[#C59B27]">
                            <span>STOP {sIdx + 1}</span>
                            <span>{stop.duration_minutes || stop.duration || 45} mins</span>
                          </div>
                          <h5 className="font-display text-sm font-bold text-[#2B070C]">
                            {stop.name}
                          </h5>
                          <p className="text-[11px] text-stone-500 truncate">
                            {stop.address || stop.tier ? `Tier ${stop.tier} Heritage` : 'Curated Place'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TAB 3: PROVENANCE & DETERMINISTIC MATH */}
        {activeTab === 'provenance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Card 1: Feasibility Inequality */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E8DEC9] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#2B070C] text-[#F3D279] flex items-center justify-center font-bold">
                  ∑
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27]">
                    Mathematical Governance
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#2B070C]">
                    Deterministic +25% Transit Buffer
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
                Tourism planning often fails because real-world traffic, terrain, parking, and security queues cause travelers to miss deadlines. Beyond the Fort enforces an immutable safety inequality in code:
              </p>

              <div className="p-4 rounded-2xl bg-stone-900 text-[#F3D279] font-mono text-sm leading-loose border border-stone-800">
                T_day = T_travel + 1.25 × T_transit + T_dwell ≤ T_budget
              </div>

              <ul className="text-xs text-stone-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1.25 Multiplier:</strong> Injects 15 minutes of buffer for every 60 minutes of transit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Deterministic Pruning:</strong> If a stop's transit buffer breaches the user's return deadline, the Optimizer Agent prunes it automatically.</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Zero-Hallucination ASI Verification */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E8DEC9] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                    Data Integrity Standard
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#2B070C]">
                    Zero-Hallucination ASI Catalog
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
                All 57 attraction records in our active catalog are verified against Archaeological Survey of India (ASI) records, official Madhya Pradesh Tourism gazettes, and ground-truth coordinates:
              </p>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700">Verified Heritage Monuments:</span>
                  <span className="font-mono font-bold text-emerald-700">32 ASI Sites</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700">Verified Local Culinary & Crafts:</span>
                  <span className="font-mono font-bold text-emerald-700">25 Stakeholder Venues</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700">Synthetic Records Permitted:</span>
                  <span className="font-mono font-bold text-red-600">0 (Strictly Quarantined)</span>
                </div>
              </div>

              <p className="text-xs text-stone-500 font-light">
                No LLM is permitted to invent new attraction names, operating hours, or GPS coordinates. The LLM acts purely as an orchestrator and reasoning engine over the immutable verified dataset.
              </p>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
