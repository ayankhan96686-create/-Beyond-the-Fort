import {
  Landmark, Music, Compass, Route, Sparkles, Clock, UtensilsCrossed, ShoppingBag, ChevronRight
} from 'lucide-react';

export default function Dashboard({
  setActiveTab,
  setIsChatOpen,
  selectedPlaces,
  selectedHours,
  setSelectedHours,
  tourPace,
  setTourPace,
  itineraryStats,
  handleAutoFitPlaces,
  setSelectedCategory,
  selectedLanguage,
  t
}) {
  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Royal Cultural Welcome Card */}
      <div className="w-full relative rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-xl bg-linear-to-r from-[#8B0000] via-[#750000] to-[#500000] text-white p-4 sm:p-8">
        <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-8 pointer-events-none">
          <Landmark className="w-80 h-80 text-[#D4AF37]" />
        </div>
        
        <div className="relative z-10 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#5E0000] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Music className="w-3.5 h-3.5" /> {t('unescoBadge')}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-stone-200 text-xs border border-white/20">
              {t('stateBadge')}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-[#F5D77F] text-xs border border-[#D4AF37]/30">
              {t('weatherBadge')}
            </span>
          </div>

          <h1 className="font-heritage text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2 leading-tight">
            {t('welcomeTitle')}
          </h1>
          <h2 className="font-heritage text-base sm:text-2xl text-[#F5D77F] font-medium mb-3">
            "{t('welcomeSubtitle')}"
          </h2>
          <p className="text-stone-200 text-xs sm:text-sm leading-relaxed w-full mb-6">
            {t('welcomeDescription')}
          </p>

          {/* Quick Traveler Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('explore')}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-[#5E0000] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#5E0000]" />
              <span>{t('exploreBtn')}</span>
            </button>
            <button
              onClick={() => setActiveTab('route')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Route className="w-4 h-4 text-[#F5D77F]" />
              <span>{t('viewRouteBtn')} ({selectedPlaces.length})</span>
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-[#F5D77F] font-semibold text-xs border border-[#D4AF37]/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('askAIBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Time-Budget Input Section */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#D4AF37]/40 shadow-xs">
        <div className="w-full mb-6 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-[#8B0000]" />
            <h3 className="font-heritage text-lg sm:text-xl font-bold text-[#8B0000]">
              {t('timePlannerTitle')}
            </h3>
          </div>
          <p className="text-xs text-[#6B5E55]">
            {t('timePlannerDesc')}
          </p>
        </div>

        {/* Slider & Visual Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
          {/* Left Column: Interactive slider & quick-select preset buttons */}
          <div className="w-full lg:col-span-7 space-y-5">
            {/* Quick-Select Buttons / Preset Pills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#6B5E55] uppercase tracking-wider">
                  {selectedLanguage === 'hi' ? 'त्वरित समय विकल्प' : 'Quick Presets'}
                </span>
                <span className="text-[11px] text-stone-400">
                  {selectedLanguage === 'hi' ? 'समय सीमा चुनें' : 'Choose tour duration'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { hrs: 2, labelKey: 'preset2h', fallback: '2 Hours' },
                  { hrs: 3, labelKey: 'preset3h', fallback: '3 Hours' },
                  { hrs: 5, labelKey: 'preset5h', fallback: '5 Hours' },
                  { hrs: 8, labelKey: 'preset8h', fallback: '8 Hours' }
                ].map(preset => {
                  const isSelected = Number(selectedHours) === preset.hrs;
                  return (
                    <button
                      key={preset.hrs}
                      type="button"
                      onClick={() => setSelectedHours(preset.hrs)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-center cursor-pointer border ${
                        isSelected
                          ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-sm ring-2 ring-[#D4AF37]/50'
                          : 'bg-[#FDFBF7] text-[#6B5E55] border-[#E8DFC8] hover:bg-[#D4AF37]/15 hover:text-[#8B0000] hover:border-[#D4AF37]/50'
                      }`}
                    >
                      {t(preset.labelKey) || preset.fallback}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Range Slider */}
            <div className="space-y-3 pt-1">
              <div className="w-full flex items-center justify-between text-xs font-semibold">
                <span className="text-[#6B5E55]">{t('hoursAvailable')}:</span>
                <span className="text-base font-bold text-[#8B0000] bg-[#8B0000]/10 px-3.5 py-1 rounded-full border border-[#8B0000]/20 shadow-2xs">
                  {selectedHours} {selectedLanguage === 'hi' ? 'घंटे उपलब्ध' : 'Hours Available'}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={selectedHours}
                onChange={(e) => setSelectedHours(parseFloat(e.target.value) || 1)}
                onInput={(e) => setSelectedHours(parseFloat(e.target.value) || 1)}
                aria-label="Time Budget in Hours"
                className="w-full h-2.5 bg-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#8B0000]"
              />

              <div className="flex justify-between text-[11px] text-stone-400 font-medium px-0.5">
                <span>1h ({t('fast')})</span>
                <span>4h ({t('balanced')})</span>
                <span>8h ({t('preset8h') ? t('preset8h').split(' ')[0] + 'h' : '8h'})</span>
                <span>10h+</span>
              </div>
            </div>

            {/* Pace Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-600 mr-1">{t('travelPace')}</span>
              {[
                { key: 'relaxed', labelKey: 'relaxed' },
                { key: 'balanced', labelKey: 'balanced' },
                { key: 'fast', labelKey: 'fast' }
              ].map(pace => (
                <button
                  key={pace.key}
                  type="button"
                  onClick={() => setTourPace(pace.key)}
                  className={`text-xs px-3 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                    tourPace === pace.key
                      ? 'bg-[#AA820A] text-white font-bold shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t(pace.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Itinerary Feasibility Card */}
          <div className="w-full lg:col-span-5 bg-[#FDFBF7] p-5 sm:p-6 rounded-xl border border-[#D4AF37]/40 shadow-xs space-y-3.5">
            <div className="w-full flex items-center justify-between text-xs">
              <span className="font-bold text-[#8B0000] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-[#8B0000]" />
                {t('itineraryFeasibility')}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase ${
                itineraryStats.fitsBudget
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {itineraryStats.fitsBudget ? `✓ ${t('fitsBudget')}` : `+${itineraryStats.deficitHours}h ${t('overBudget')}`}
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#2D241E]">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#6B5E55]">{t('selectedPlacesLabel')}</span>
                <span className="font-semibold text-stone-800">
                  {itineraryStats.count} {selectedLanguage === 'hi' ? 'स्थान' : 'spots'}
                  {itineraryStats.count > 0 && !itineraryStats.fitsBudget && (
                    <span className="ml-1.5 text-[10px] text-amber-700 font-medium">
                      ({itineraryStats.fittingSpotsCount} {selectedLanguage === 'hi' ? 'समय में' : 'fit budget'})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#6B5E55]">{t('explorationTime')}</span>
                <span className="font-semibold text-stone-800">{itineraryStats.totalMinutes} mins</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#6B5E55]">{t('transitBuffer')}</span>
                <span className="font-semibold text-stone-800">~{itineraryStats.transitMinutes} mins</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E8DFC8] font-bold text-sm text-[#8B0000]">
                <span>{t('totalDuration')}</span>
                <span>{itineraryStats.grossHours} {selectedLanguage === 'hi' ? 'घंटे' : 'Hours'}</span>
              </div>
            </div>

            {/* Auto-Fit / Optimize Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAutoFitPlaces}
                className="w-full py-2 px-3 rounded-xl bg-linear-to-r from-[#D4AF37]/20 via-[#D4AF37]/30 to-[#D4AF37]/20 hover:from-[#D4AF37]/35 hover:to-[#D4AF37]/35 text-[#8B0000] border border-[#D4AF37]/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B0000]" />
                <span>
                  {selectedLanguage === 'hi'
                    ? `${selectedHours} घंटे के अनुसार स्थल अनुकूलित करें`
                    : `Auto-Fit Spots to ${selectedHours}h Budget`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Category Selector: 3 Prominent Cards */}
      <div className="w-full">
        <div className="mb-4">
          <h3 className="font-heritage text-xl sm:text-2xl font-bold text-[#8B0000]">
            {t('categoriesTitle')}
          </h3>
          <p className="text-xs text-[#6B5E55]">
            {t('categoriesSubtitle')}
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* 1. Sightseeing Card */}
          <div
            onClick={() => {
              setSelectedCategory('sightseeing');
              setActiveTab('explore');
            }}
            className="w-full group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white border-[#E8DFC8] hover:border-[#D4AF37]"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1599831104325-508b98453e92?auto=format&fit=crop&w=800&q=80"
                alt="Gwalior Sightseeing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3 bg-[#8B0000] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D4AF37]">
                {t('catSightseeingCount')}
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Landmark className="w-5 h-5 text-[#D4AF37]" />
                  <h4 className="font-heritage text-lg font-bold">{t('catSightseeing')}</h4>
                </div>
                <p className="text-[11px] text-stone-200">
                  {t('catSightseeingSub')}
                </p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#6B5E55] line-clamp-2">
                {t('catSightseeingDesc')}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-semibold text-[#8B0000]">
                <span>{t('browseSpots')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* 2. Eating / Food Card */}
          <div
            onClick={() => {
              setSelectedCategory('eating');
              setActiveTab('explore');
            }}
            className="w-full group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white border-[#E8DFC8] hover:border-[#D4AF37]"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
                alt="Gwalior Delicacies"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3 bg-[#AA820A] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#F5D77F]">
                {t('catEatingCount')}
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <UtensilsCrossed className="w-5 h-5 text-[#F5D77F]" />
                  <h4 className="font-heritage text-lg font-bold">{t('catEating')}</h4>
                </div>
                <p className="text-[11px] text-stone-200">
                  {t('catEatingSub')}
                </p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#6B5E55] line-clamp-2">
                {t('catEatingDesc')}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-semibold text-[#8B0000]">
                <span>{t('browseSpots')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* 3. Shopping Card */}
          <div
            onClick={() => {
              setSelectedCategory('shopping');
              setActiveTab('explore');
            }}
            className="w-full group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white border-[#E8DFC8] hover:border-[#D4AF37]"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                alt="Gwalior Handlooms"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3 bg-[#5E0000] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D4AF37]">
                {t('catShoppingCount')}
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                  <h4 className="font-heritage text-lg font-bold">{t('catShopping')}</h4>
                </div>
                <p className="text-[11px] text-stone-200">
                  {t('catShoppingSub')}
                </p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#6B5E55] line-clamp-2">
                {t('catShoppingDesc')}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-semibold text-[#8B0000]">
                <span>{t('browseSpots')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

