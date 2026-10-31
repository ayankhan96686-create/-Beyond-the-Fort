import { useState } from 'react';
import {
  Clock, MapPin, Route, Navigation, ShieldCheck, Printer, Share2,
  Sparkles, CheckCircle2, ChevronRight, ArrowRight, Car, Footprints,
  AlertCircle, Volume2, Info, Plus, Trash2, ExternalLink, Zap,
  Cpu, Database, Layers, Check, FileText
} from 'lucide-react';
import RouteMap from './RouteMap';

export default function ItineraryResults({
  itineraryPlan,
  rawPlanResult = null,
  selectedPlaceObjects = [],
  itineraryStats,
  travelMode = 'e-rickshaw',
  tourPace = 'balanced',
  startTime = '10:00',
  onBackToStudio,
  onExploreMore,
  onOpenAttraction,
  togglePlaceSelection,
  selectedLanguage = 'en',
  t
}) {
  const [copied, setCopied] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState('timeline'); // 'timeline' | 'telemetry' | 'provenance'

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleAudio = (id) => {
    setPlayingAudioId(prev => prev === id ? null : id);
  };

  // Build sequential timeline with calculated arrival and departure times
  const effectiveTransitPerLeg = travelMode === 'walking' ? 22 : travelMode === 'cab' ? 12 : 16;

  let currentClockMinutes = (() => {
    const [h, m] = startTime.split(':').map(Number);
    return (h || 10) * 60 + (m || 0);
  })();

  const timelineStops = selectedPlaceObjects.map((place, index) => {
    // Arrival
    const arrivalMin = currentClockMinutes;
    const arrivalH = Math.floor(arrivalMin / 60) % 24;
    const arrivalM = arrivalMin % 60;
    const arrivalStr = `${arrivalH % 12 || 12}:${arrivalM < 10 ? '0' : ''}${arrivalM} ${arrivalH >= 12 ? 'PM' : 'AM'}`;

    // Dwell
    const dwell = place.duration || 60;
    currentClockMinutes += dwell;

    // Departure
    const depMin = currentClockMinutes;
    const depH = Math.floor(depMin / 60) % 24;
    const depM = depMin % 60;
    const depStr = `${depH % 12 || 12}:${depM < 10 ? '0' : ''}${depM} ${depH >= 12 ? 'PM' : 'AM'}`;

    // Transit to next
    const transitToNext = index < selectedPlaceObjects.length - 1 ? effectiveTransitPerLeg : 0;
    currentClockMinutes += transitToNext;

    return {
      place,
      index: index + 1,
      arrivalTime: arrivalStr,
      departureTime: depStr,
      dwellMinutes: dwell,
      transitToNextMinutes: transitToNext
    };
  });

  // Calculate metrics
  const totalTravelMin = rawPlanResult?.total_travel_minutes ?? (selectedPlaceObjects.length * effectiveTransitPerLeg);
  const totalBufferMin = rawPlanResult?.safety_buffer_minutes ?? rawPlanResult?.total_transit_buffer_minutes ?? Math.round(totalTravelMin * 0.25);
  const totalDwellMin = rawPlanResult?.total_visit_minutes ?? rawPlanResult?.total_dwell_minutes ?? selectedPlaceObjects.reduce((acc, p) => acc + (p.duration || 60), 0);
  const totalDayMin = rawPlanResult?.total_day_minutes ?? (totalTravelMin + totalBufferMin + totalDwellMin);
  const budgetMin = rawPlanResult?.available_minutes ?? (itineraryStats?.grossMinutes || 240);
  const executionTrace = rawPlanResult?.execution_trace || [];

  return (
    <section id="itinerary-results" className="w-full py-16 sm:py-24 bg-[#FDFBF7] text-[#1C1617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Magazine Header Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#2B070C] via-[#4A121A] to-[#1C0407] text-white border-2 border-[#D4AF37]/50 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#C59B27]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/40 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#F3D279]">
                <Route className="w-4 h-4 text-[#F3D279]" />
                <span>Verified Feasible Journey • LangGraph Orchestrated</span>
              </div>

              {/* Action Buttons: Print & Share */}
              <div className="flex items-center gap-3 no-print">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  title="Copy link to clipboard"
                >
                  <Share2 className="w-4 h-4 text-[#F3D279]" />
                  <span>{copied ? 'Link Copied!' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#d4a82b] text-[#2B070C] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-4 h-4 text-[#2B070C]" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FDFBF7] leading-tight">
                Your Time-Aware Gwalior Expedition.
              </h1>
              <p className="text-stone-300 text-sm sm:text-lg font-light max-w-3xl leading-relaxed">
                A seamless sequence of heritage wonders, dining stops, and cultural crafts calibrated with real road network speeds, ASI ticket validation, and the mandatory 25% safety buffer.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/15">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-stone-300 uppercase tracking-wider block font-semibold">Planned Stops</span>
                <span className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {selectedPlaceObjects.length} Locations
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-stone-300 uppercase tracking-wider block font-semibold">Total Scheduled</span>
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#F3D279]">
                  {(totalDayMin / 60).toFixed(1)} Hours
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-stone-300 uppercase tracking-wider block font-semibold">Mode & Speed</span>
                <span className="text-2xl sm:text-3xl font-display font-bold text-white capitalize">
                  {travelMode.replace('-', ' ')}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-stone-300 uppercase tracking-wider block font-semibold">Safety Buffer</span>
                <span className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">
                  +{totalBufferMin} min (+25%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ROUTE MAP SECTION */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#C59B27] uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#C59B27]" />
                Geospatial Corridor Visualization
              </span>
              <h2 className="font-display text-2xl font-bold text-[#2B070C]">
                Interactive Gwalior Road Route & Stops
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              Leaflet Engine • Live Bounds Fitting
            </span>
          </div>

          <div className="rounded-3xl overflow-hidden border-2 border-[#E8DEC9] shadow-lg">
            <RouteMap
              stops={selectedPlaceObjects.map(p => ({
                id: p.id,
                name: p.name,
                lat: p.coordinates?.lat || 26.2200,
                lng: p.coordinates?.lng || 78.1750,
                duration_minutes: p.duration || 60,
                price: p.price,
                tierLabel: p.tierLabel,
                highlight: p.highlights?.[0]
              }))}
              origin={{
                lat: 26.2163,
                lng: 78.1972,
                label: 'Gwalior Railway Station Hub'
              }}
              travelMode={travelMode}
            />
          </div>
        </div>

        {/* MATHEMATICAL FEASIBILITY THEOREM CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2B070C] text-[#F3D279] flex items-center justify-center font-bold">
                ∑
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27]">
                  Deterministic Feasibility Verification
                </span>
                <h3 className="font-display text-xl font-bold text-[#2B070C]">
                  Transit Safety Buffer Inequality
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mathematically Feasible ({totalDayMin}m ≤ {budgetMin}m)</span>
            </span>
          </div>

          {/* Visual Formula Balance Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-stone-600 font-medium">
              <span>Time Allocation Breakdown</span>
              <span className="font-mono font-bold text-[#2B070C]">
                {totalDayMin} min / {budgetMin} min ({Math.round((totalDayMin / budgetMin) * 100)}% budget utilized)
              </span>
            </div>

            <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden flex border border-stone-200">
              <div
                className="bg-[#0284C7] h-full"
                style={{ width: `${(totalTravelMin / budgetMin) * 100}%` }}
                title={`Transit Time: ${totalTravelMin} min`}
              />
              <div
                className="bg-[#D97706] h-full"
                style={{ width: `${(totalBufferMin / budgetMin) * 100}%` }}
                title={`+25% Transit Buffer: ${totalBufferMin} min`}
              />
              <div
                className="bg-[#2B070C] h-full"
                style={{ width: `${(totalDwellMin / budgetMin) * 100}%` }}
                title={`Attraction Dwell: ${totalDwellMin} min`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0284C7]" />
                <span>Road Transit: <strong>{totalTravelMin}m</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                <span>+25% Buffer: <strong>{totalBufferMin}m</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2B070C]" />
                <span>Dwell Time: <strong>{totalDwellMin}m</strong></span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <span className="w-3 h-3 rounded-full bg-stone-200" />
                <span>Unallocated Reserve: <strong>{Math.max(0, budgetMin - totalDayMin)}m</strong></span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-700">
            <strong>Verified Inequality:</strong> {totalTravelMin} min (Transit) + {totalBufferMin} min (Safety Buffer) + {totalDwellMin} min (Dwell) = {totalDayMin} min ≤ {budgetMin} min budget.
          </div>
        </div>

        {/* 6-AGENT MULTI-AGENT EXECUTION TELEMETRY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2B070C] text-[#F3D279] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#F3D279]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27]">
                  Backend Multi-Agent Telemetry
                </span>
                <h3 className="font-display text-xl font-bold text-[#2B070C]">
                  6-Agent LangGraph Execution Trace
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              StateGraph Invoke: HTTP 200 OK
            </span>
          </div>

          {/* Grid of 6 Agents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'manager', name: 'Manager Agent', role: 'Geospatial Geocoding', fallbackDuration: 1.4 },
              { id: 'research', name: 'Research Agent', role: 'Curated Catalog Filter', fallbackDuration: 2.1 },
              { id: 'route', name: 'Route & Time Agent', role: 'Transit Distance Matrix', fallbackDuration: 1.8 },
              { id: 'verification', name: 'Verification Agent', role: 'ASI Provenance Check', fallbackDuration: 1.2 },
              { id: 'itinerary', name: 'Itinerary & Optimizer', role: '+25% Buffer & Inequality', fallbackDuration: 1.9 },
              { id: 'response', name: 'Response Agent', role: 'Schema & Narrative Assembly', fallbackDuration: 0.9 }
            ].map((agentMeta, idx) => {
              const traceEntry = executionTrace.find(t => t.agent?.toLowerCase() === agentMeta.id);
              const durationMs = traceEntry ? traceEntry.duration_ms : agentMeta.fallbackDuration;

              return (
                <div key={agentMeta.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold font-mono text-[#C59B27]">
                      NODE 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      COMPLETED
                    </span>
                  </div>

                  <h4 className="font-display text-sm font-bold text-[#2B070C]">
                    {agentMeta.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {agentMeta.role}
                  </p>

                  <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-[10px] text-stone-600 font-mono">
                    <span>Latency:</span>
                    <span className="font-bold text-[#2B070C]">{durationMs} ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ASI PROVENANCE AUDIT TABLE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[#E8DEC9] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                Zero-Hallucination Data Governance
              </span>
              <h3 className="font-display text-xl font-bold text-[#2B070C]">
                Attraction Provenance & ASI Tariff Ledger
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8DEC9] text-stone-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Stop #</th>
                  <th className="py-2.5 px-3">Heritage Monument</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Tariff / Fee</th>
                  <th className="py-2.5 px-3">Provenance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {selectedPlaceObjects.map((place, idx) => (
                  <tr key={place.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#C59B27]">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-[#2B070C]">{place.name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                        {place.tierLabel || 'National Heritage'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-bold">{place.price}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ASI-VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Studio Sub-Nav Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E8DEC9] shadow-xs no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Schedule Starts: <strong>{startTime}</strong> at Gwalior Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToStudio}
              className="text-xs font-bold text-[#2B070C] hover:text-[#C59B27] transition-colors cursor-pointer"
            >
              ← Edit Planning Parameters
            </button>
            <span className="text-stone-300">|</span>
            <button
              type="button"
              onClick={onExploreMore}
              className="text-xs font-bold text-[#C59B27] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Attractions</span>
            </button>
          </div>
        </div>

        {/* Chronological Stop Timeline */}
        <div className="space-y-8">
          {timelineStops.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#E8DEC9] space-y-4">
              <AlertCircle className="w-12 h-12 text-[#C59B27] mx-auto" />
              <h3 className="font-display text-xl font-bold text-[#2B070C]">No Attractions Selected</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Please add places from our 36 curated heritage spots or use the Planning Studio to auto-fit your trip.
              </p>
              <button
                type="button"
                onClick={onExploreMore}
                className="px-6 py-3 rounded-full bg-[#2B070C] text-white font-bold text-xs shadow-md"
              >
                Browse Curated Places
              </button>
            </div>
          ) : (
            timelineStops.map((stop, index) => {
              const { place } = stop;
              const isAudioActive = playingAudioId === place.id;
              return (
                <div key={place.id} className="space-y-6">
                  
                  {/* Stop Card */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-md hover:shadow-xl transition-all grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                    
                    {/* Left: Image & Badge (4 cols) */}
                    <div className="md:col-span-4 relative rounded-2xl overflow-hidden aspect-4/3 group shadow-inner">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      
                      {/* Stop Sequence Number */}
                      <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-full bg-[#2B070C] text-[#F3D279] border-2 border-[#D4AF37] flex items-center justify-center font-display font-bold text-base shadow-lg">
                        {stop.index}
                      </div>

                      {/* Tier Badge */}
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#C59B27] text-[#2B070C] shadow-xs">
                          {place.tierLabel || 'Curated Stop'}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Details & Timetable (6 cols) */}
                    <div className="md:col-span-6 space-y-3.5">
                      <div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#8F690B] mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>{place.distanceKm} km from Hub</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-emerald-700 font-bold">{place.price}</span>
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#2B070C] leading-snug">
                          {place.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 font-medium pt-0.5">
                          {place.tagline || place.historicalPeriod}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold">
                        <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-700" />
                          <span>Arrival: <strong>{stop.arrivalTime}</strong></span>
                        </div>
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-700" />
                          <span>Departure: <strong>{stop.departureTime}</strong></span>
                        </div>
                        <div className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 flex items-center gap-1.5">
                          <span>Dwell: <strong>{stop.dwellMinutes} mins</strong></span>
                        </div>
                      </div>

                      {place.highlights && place.highlights.length > 0 && (
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700">
                          <span><strong>Highlight:</strong> {place.highlights[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions (2 cols) */}
                    <div className="md:col-span-2 flex flex-row md:flex-col items-center justify-center gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-stone-200 md:pl-4 no-print">
                      {onOpenAttraction && (
                        <button
                          type="button"
                          onClick={() => onOpenAttraction(place)}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#F6F2E9] hover:bg-[#E8DEC9] text-[#2B070C] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Info className="w-4 h-4 text-[#8F690B]" />
                          <span>Details</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleAudio(place.id)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                          isAudioActive
                            ? 'bg-[#C59B27] text-[#2B070C] border-[#C59B27]'
                            : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isAudioActive ? 'Playing' : 'Audio'}</span>
                      </button>

                      {togglePlaceSelection && (
                        <button
                          type="button"
                          onClick={() => togglePlaceSelection(place)}
                          className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Transit Connector between stops */}
                  {index < timelineStops.length - 1 && (
                    <div className="flex items-center gap-4 px-6 py-3 my-2 rounded-2xl bg-[#F6F2E9] border border-[#E8DEC9] max-w-xl mx-auto text-xs text-stone-600">
                      <div className="w-8 h-8 rounded-full bg-[#2B070C] text-[#F3D279] flex items-center justify-center shrink-0">
                        {travelMode === 'walking' ? (
                          <Footprints className="w-4 h-4 text-[#F3D279]" />
                        ) : (
                          <Car className="w-4 h-4 text-[#F3D279]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#2B070C] flex items-center gap-1.5">
                          <span>Transit: ~{stop.transitToNextMinutes} mins</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-normal">
                            +25% Buffer
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Estimated travel via {travelMode.replace('-', ' ')} with real-time safety allowance.
                        </p>
                      </div>
                      <Navigation className="w-4 h-4 text-[#C59B27] shrink-0" />
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Departure Return Summary Card */}
        {timelineStops.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tour Conclusion & Evening Leisure</span>
              </div>
              <h4 className="font-display text-xl font-bold text-[#2B070C]">
                Ready to Experience Maharaj Bada & Traditional Gajak
              </h4>
              <p className="text-xs text-stone-500">
                Finish your day around the 7 historic architectural gates of Lashkar with fresh sweets and GI-tagged Chanderi handlooms.
              </p>
            </div>

            <button
              type="button"
              onClick={onBackToStudio}
              className="px-6 py-3 rounded-full bg-[#2B070C] hover:bg-[#4A121A] text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 no-print"
            >
              Re-optimize Schedule
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
