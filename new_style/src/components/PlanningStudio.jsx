import { useState } from 'react';
import {
  Clock, MapPin, Compass, Sparkles, AlertCircle, CheckCircle2,
  Car, Footprints, ShieldCheck, ChevronRight, RefreshCw, Sliders, Calendar,
  Landmark, Music, ShoppingBag, UtensilsCrossed
} from 'lucide-react';

export default function PlanningStudio({
  selectedHours,
  setSelectedHours,
  tourPace,
  setTourPace,
  travelMode,
  setTravelMode,
  selectedPlaces = [],
  setSelectedPlaces,
  itineraryStats,
  handleAutoFitPlaces,
  onGenerateItinerary,
  isGenerating = false,
  selectedLanguage = 'en',
  t
}) {
  // Local studio state
  const [startLocation, setStartLocation] = useState('gw-station');
  const [customStartText, setCustomStartText] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [selectedInterests, setSelectedInterests] = useState([
    'heritage', 'music', 'food'
  ]);

  const startLocationPresets = [
    {
      id: 'gw-station',
      label: 'Gwalior Railway Station',
      sub: 'Platform 1 Main Exit Hub',
      coords: { lat: 26.2163, lng: 78.1972 }
    },
    {
      id: 'gw-bada',
      label: 'Maharaj Bada (Lashkar)',
      sub: 'Central Heritage Town Square',
      coords: { lat: 26.2025, lng: 78.1637 }
    },
    {
      id: 'gw-fort-gate',
      label: 'Gwalior Fort Urvahi Gate',
      sub: 'Western Cliff Approach',
      coords: { lat: 26.2301, lng: 78.1685 }
    },
    {
      id: 'gw-airport',
      label: 'Rajmata Scindia Airport',
      sub: 'Civil Aviation Terminal',
      coords: { lat: 26.2941, lng: 78.2290 }
    }
  ];

  const travelModes = [
    {
      id: 'e-rickshaw',
      name: 'E-Rickshaw / Auto',
      speed: '~18 km/h',
      desc: 'Optimal for Lashkar lanes, fort foothills & bazaars',
      icon: Car,
      tag: 'Recommended'
    },
    {
      id: 'cab',
      name: 'Private AC Tourist Cab',
      speed: '~28 km/h',
      desc: 'Comfortable for extended trips & Tigra Dam',
      icon: Car,
      tag: 'Fast & AC'
    },
    {
      id: 'walking',
      name: 'Heritage Walking',
      speed: '~4.2 km/h',
      desc: 'Best for intimate street immersion & food tasting',
      icon: Footprints,
      tag: 'Immersive'
    }
  ];

  const interestPillars = [
    { id: 'heritage', label: 'Citadels & Palaces', icon: Landmark, count: 12 },
    { id: 'music', label: 'UNESCO Music & Tansen', icon: Music, count: 8 },
    { id: 'crafts', label: 'Chanderi Weavers & Crafts', icon: ShoppingBag, count: 6 },
    { id: 'food', label: 'Heritage Cuisine & Sweets', icon: UtensilsCrossed, count: 10 }
  ];

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleStartSubmit = (e) => {
    e.preventDefault();
    if (selectedPlaces.length === 0 && handleAutoFitPlaces) {
      handleAutoFitPlaces();
    }
    if (onGenerateItinerary) {
      onGenerateItinerary({
        startLocation: customStartText || startLocation,
        startTime,
        selectedHours,
        travelMode,
        tourPace,
        selectedInterests
      });
    }
  };

  return (
    <section id="planning-studio" className="w-full py-20 sm:py-28 bg-[#F6F2E9] text-[#1C1617] border-t border-[#E8DEC9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#8F690B]">
            <span>⚙</span> Precision Travel Orchestration
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2B070C] tracking-tight leading-tight">
            The Interactive Planning Studio.
          </h2>
          <p className="text-base sm:text-lg text-stone-700 font-light leading-relaxed">
            Configure your schedule, travel mode, and cultural passions. Our multi-agent engine calculates real-world transit delays and guarantees a deterministic 25% safety buffer.
          </p>
        </div>

        {/* Full-Width Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Starting Hub */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2B070C] text-[#F3D279] flex items-center justify-center font-display font-bold text-lg shadow-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2B070C]">
                      Departure & Starting Hub
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Where will you begin your Gwalior expedition?
                    </p>
                  </div>
                </div>
                <MapPin className="w-6 h-6 text-[#C59B27]" />
              </div>

              {/* Location Preset Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {startLocationPresets.map((preset) => {
                  const isSelected = startLocation === preset.id && !customStartText;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setStartLocation(preset.id);
                        setCustomStartText('');
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2B070C] text-white border-[#2B070C] shadow-md ring-2 ring-[#C59B27]/60'
                          : 'bg-[#FDFBF7] text-[#1C1617] border-[#E8DEC9] hover:border-[#C59B27] hover:bg-[#FDF8EE]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-sm sm:text-[15px] font-bold leading-snug ${isSelected ? 'text-[#F3D279]' : 'text-[#2B070C]'}`}>
                          {preset.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#F3D279] shrink-0" />}
                      </div>
                      <p className={`text-xs mt-1 font-medium ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                        {preset.sub}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Starting Location Input */}
              <div className="pt-2">
                <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-2">
                  Or enter your Hotel / Local Landmark:
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customStartText}
                    onChange={(e) => {
                      setCustomStartText(e.target.value);
                      if (e.target.value) setStartLocation('custom');
                    }}
                    placeholder="e.g. Usha Kiran Palace, City Center, Morar Cantt..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DEC9] text-sm text-[#1C1617] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Time Budget & Schedule */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2B070C] text-[#F3D279] flex items-center justify-center font-display font-bold text-lg shadow-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2B070C]">
                      Available Hours & Time Window
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Tailor the itinerary strictly within your clock constraints.
                    </p>
                  </div>
                </div>
                <Clock className="w-6 h-6 text-[#C59B27]" />
              </div>

              {/* Preset Duration Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { hrs: 2, label: '2 Hours', tag: 'Swift Highlights' },
                  { hrs: 4, label: '4 Hours', tag: 'Half-Day Classic' },
                  { hrs: 6, label: '6 Hours', tag: 'Deep Heritage' },
                  { hrs: 8, label: '8 Hours', tag: 'Full Day Immersion' }
                ].map((preset) => {
                  const isSelected = Number(selectedHours) === preset.hrs;
                  return (
                    <button
                      key={preset.hrs}
                      type="button"
                      onClick={() => setSelectedHours(preset.hrs)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2B070C] text-white border-[#2B070C] shadow-md ring-2 ring-[#C59B27]/50'
                          : 'bg-[#FDFBF7] text-[#1C1617] border-[#E8DEC9] hover:bg-[#FDF8EE] hover:border-[#C59B27]'
                      }`}
                    >
                      <div className={`text-base font-bold ${isSelected ? 'text-[#F3D279]' : 'text-[#2B070C]'}`}>
                        {preset.label}
                      </div>
                      <div className={`text-xs mt-1 font-medium ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                        {preset.tag}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Continuous Time Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-stone-700">Continuous Time Adjustment:</span>
                  <span className="text-base font-bold text-[#2B070C] bg-[#C59B27]/15 px-4 py-1.5 rounded-full border border-[#C59B27]/40">
                    {selectedHours} Hours Allocated
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={selectedHours}
                  onChange={(e) => setSelectedHours(parseFloat(e.target.value) || 1)}
                  aria-label="Trip Duration Hours"
                  className="w-full h-2.5 bg-[#E8DEC9] rounded-lg appearance-none cursor-pointer accent-[#2B070C]"
                />
                <div className="flex justify-between text-xs text-stone-500 font-medium px-1">
                  <span>1 Hour (Express)</span>
                  <span>4 Hours (Balanced)</span>
                  <span>7 Hours</span>
                  <span>10+ Hours (Comprehensive)</span>
                </div>
              </div>

              {/* Start Time Selection */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#8F690B]" />
                  <span className="text-xs sm:text-sm font-bold text-stone-700">Planned Start Time:</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E8DEC9] bg-[#FDFBF7] text-sm font-bold text-[#2B070C] focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                  />
                  <span className="text-xs text-stone-600 font-medium">
                    Finish ~{(() => {
                      const [h, m] = startTime.split(':').map(Number);
                      const totalMin = (h || 10) * 60 + (m || 0) + Math.round(selectedHours * 60);
                      const finH = Math.floor(totalMin / 60) % 24;
                      const finM = totalMin % 60;
                      const ampm = finH >= 12 ? 'PM' : 'AM';
                      const dispH = finH % 12 || 12;
                      return `${dispH}:${finM < 10 ? '0' : ''}${finM} ${ampm}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Travel Mode & Urban Navigation */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2B070C] text-[#F3D279] flex items-center justify-center font-display font-bold text-lg shadow-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2B070C]">
                      Transportation Mode & Mobility Speed
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Different modes calculate transit times with calibrated speeds.
                    </p>
                  </div>
                </div>
                <Car className="w-6 h-6 text-[#C59B27]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                {travelModes.map((mode) => {
                  const isSelected = travelMode === mode.id;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTravelMode(mode.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#2B070C] text-white border-[#2B070C] shadow-md ring-2 ring-[#C59B27]/50'
                          : 'bg-[#FDFBF7] text-[#1C1617] border-[#E8DEC9] hover:bg-[#FDF8EE] hover:border-[#C59B27]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[#F3D279]' : 'text-[#8F690B]'}`} />
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-[#F3D279] text-[#2B070C]' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {mode.tag}
                          </span>
                        </div>
                        <div className={`text-sm sm:text-base font-bold leading-snug ${isSelected ? 'text-[#F3D279]' : 'text-[#2B070C]'}`}>
                          {mode.name}
                        </div>
                        <p className={`text-xs mt-1.5 leading-relaxed font-medium ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                          {mode.desc}
                        </p>
                      </div>
                      <div className={`mt-3.5 pt-2 border-t ${isSelected ? 'border-white/20 text-[#F3D279]' : 'border-stone-200 text-stone-500'} text-xs font-mono font-bold uppercase tracking-wider`}>
                        Avg Speed: {mode.speed}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pace Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <span className="text-xs sm:text-sm font-bold text-stone-700">Exploration Pace:</span>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'relaxed', label: 'Relaxed (In-Depth)' },
                    { id: 'balanced', label: 'Balanced (Recommended)' },
                    { id: 'fast', label: 'Efficient (Fast)' }
                  ].map((pace) => (
                    <button
                      key={pace.id}
                      type="button"
                      onClick={() => setTourPace(pace.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        tourPace === pace.id
                          ? 'bg-[#C59B27] text-[#2B070C] shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {pace.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Cultural Interests */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DEC9] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2B070C] text-[#F3D279] flex items-center justify-center font-display font-bold text-lg shadow-xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2B070C]">
                      Cultural Pillars & Thematic Passions
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Filter priority recommendations according to your personal curiosity.
                    </p>
                  </div>
                </div>
                <Sliders className="w-6 h-6 text-[#C59B27]" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {interestPillars.map((item) => {
                  const isChecked = selectedInterests.includes(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isChecked
                          ? 'bg-[#2B070C] text-white border-[#2B070C] shadow-xs'
                          : 'bg-[#FDFBF7] text-stone-700 border-[#E8DEC9] hover:bg-[#FDF8EE]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isChecked ? 'text-[#F3D279]' : 'text-[#8F690B]'}`} />
                      <span className={`text-xs sm:text-sm font-bold ${isChecked ? 'text-white' : 'text-[#2B070C]'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Feasibility Engine & Action Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            
            {/* Feasibility Summary Card */}
            <div className="p-7 rounded-3xl bg-[#2B070C] text-white border-2 border-[#D4AF37]/50 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-[#F3D279] block mb-1">
                    Real-Time Validation
                  </span>
                  <h4 className="font-display text-2xl font-bold text-white">
                    Feasibility Scorecard
                  </h4>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
                  itineraryStats?.fitsBudget
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50'
                    : 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                }`}>
                  {itineraryStats?.fitsBudget ? '✓ Feasible' : `+${itineraryStats?.deficitHours}h Over Budget`}
                </span>
              </div>

              {/* Metric Breakdown */}
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                  <span className="text-stone-300">Staged Attractions:</span>
                  <span className="font-bold text-white text-base">
                    {selectedPlaces.length} Selected
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                  <span className="text-stone-300">Est. Dwell / Sightseeing:</span>
                  <span className="font-bold text-white text-base">
                    {itineraryStats?.totalMinutes || 0} mins
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-300">Calculated Transit:</span>
                    <span className="text-xs text-[#F3D279] bg-[#C59B27]/25 px-2 py-0.5 rounded font-bold">
                      +25% Buffer
                    </span>
                  </div>
                  <span className="font-bold text-white text-base">
                    ~{itineraryStats?.transitMinutes || 0} mins
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 text-base font-bold text-[#F3D279] border-t border-[#D4AF37]/40">
                  <span>Total Gross Time:</span>
                  <span className="text-lg">
                    {itineraryStats?.grossHours || 0} Hours
                  </span>
                </div>
              </div>

              {/* 25% Buffer Guarantee Callout */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 text-xs space-y-2 text-stone-300">
                <div className="flex items-center gap-1.5 font-bold text-[#F3D279] text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#F3D279] shrink-0" />
                  <span>Deterministic 25% Transit Buffer</span>
                </div>
                <p className="leading-relaxed">
                  Every route leg embeds a mandatory 25% safety buffer against Lashkar bazaar bottlenecks, ticket line waits, and parking walks.
                </p>
              </div>

              {/* Auto-Fit Recommendation Action */}
              {!itineraryStats?.fitsBudget && (
                <button
                  type="button"
                  onClick={handleAutoFitPlaces}
                  className="w-full py-3 px-3 rounded-2xl bg-[#C59B27]/25 hover:bg-[#C59B27]/35 text-[#F3D279] border border-[#C59B27]/50 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#F3D279]" />
                  <span>Auto-Fit Spots to {selectedHours}h Timeframe</span>
                </button>
              )}

              {/* Main Action Call to Action */}
              <button
                type="button"
                onClick={handleStartSubmit}
                disabled={isGenerating}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3D279] hover:from-[#d4a82b] hover:to-[#ffd97d] text-[#2B070C] font-display font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-[#2B070C] animate-spin" />
                    <span>Orchestrating Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#2B070C] group-hover:rotate-12 transition-transform" />
                    <span>Generate Feasible Itinerary</span>
                    <ChevronRight className="w-4 h-4 text-[#2B070C]" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Tips Box */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8DEC9] text-xs sm:text-sm text-stone-700 space-y-2">
              <div className="font-bold text-[#2B070C] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#8F690B]" />
                <span className="font-bold">Local Gwalior Advisory</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                Most monuments on the Fort Plateau close ticket counters strictly at 05:30 PM. Jai Vilas Palace is closed on Wednesdays.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

