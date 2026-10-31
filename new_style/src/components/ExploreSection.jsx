import { useState, useMemo } from 'react';
import {
  Search, Filter, MapPin, Clock, Star, ShieldCheck, Plus, Check, Eye, Compass,
  UtensilsCrossed, Music, Landmark, ShoppingBag
} from 'lucide-react';

export default function ExploreSection({
  places = [],
  selectedPlaces = [],
  togglePlaceSelection,
  onOpenAttraction,
  selectedLanguage,
  t
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');

  const categories = [
    { id: 'all', label: 'All Places', icon: Compass },
    { id: 'sightseeing', label: 'Citadels & Palaces', icon: Landmark },
    { id: 'culture_music', label: 'Music & Sangeet', icon: Music },
    { id: 'handlooms', label: 'Weavers & Crafts', icon: ShoppingBag },
    { id: 'food_bazaar', label: 'Heritage Food', icon: UtensilsCrossed }
  ];

  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Category match
      const categoryMatch = selectedCategory === 'all' || place.category === selectedCategory ||
        (selectedCategory === 'culture_music' && (place.category === 'culture_music' || place.category === 'music')) ||
        (selectedCategory === 'food_bazaar' && (place.category === 'food_bazaar' || place.category === 'culinary')) ||
        (selectedCategory === 'handlooms' && (place.category === 'handlooms' || place.category === 'crafts'));

      // Tier match
      const tierMatch = selectedTier === 'all' || place.tier === Number(selectedTier);

      // Search query match
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q ||
        place.name.toLowerCase().includes(q) ||
        (place.hindiName && place.hindiName.toLowerCase().includes(q)) ||
        (place.description && place.description.toLowerCase().includes(q)) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(q)));

      return categoryMatch && tierMatch && searchMatch;
    });
  }, [places, selectedCategory, selectedTier, searchQuery]);

  return (
    <section id="discover-section" className="w-full py-20 sm:py-28 bg-[#FDFBF7] text-[#1C1617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Editorial Section Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C59B27]">
            <span>✳</span> Curated Gwalior Archive
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2B070C] tracking-tight leading-tight">
            Discover 36 Audited Places of Interest.
          </h2>
          <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed">
            Every monument, temple, weaving pit, and culinary spot is vetted with verified ASI operating hours, GPS coordinates, and historical provenance.
          </p>
        </div>

        {/* Search & Category Filter Controls Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:w-[460px]">
              <Search className="w-5 h-5 text-[#8F690B] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Gwalior places, tombs, bazaars..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#FDFBF7] border border-[#E8DEC9] text-sm sm:text-base text-[#1C1617] placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#C59B27] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Tier Filter Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">Tier:</span>
              <button
                onClick={() => setSelectedTier('all')}
                className={`interactive-tap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTier === 'all'
                    ? 'bg-[#2B070C] text-[#F3D279] shadow-xs'
                    : 'bg-[#FDFBF7] border border-[#E8DEC9] text-stone-600 hover:bg-stone-100'
                }`}
              >
                All Tiers
              </button>
              <button
                onClick={() => setSelectedTier('1')}
                className={`interactive-tap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTier === '1'
                    ? 'bg-[#C59B27] text-[#2B070C] font-extrabold shadow-xs'
                    : 'bg-[#FDFBF7] border border-[#E8DEC9] text-stone-600 hover:bg-stone-100'
                }`}
              >
                Tier 1 (Iconic)
              </button>
              <button
                onClick={() => setSelectedTier('2')}
                className={`interactive-tap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTier === '2'
                    ? 'bg-[#176B67] text-[#DDEDE8] font-extrabold shadow-xs'
                    : 'bg-[#FDFBF7] border border-[#E8DEC9] text-stone-600 hover:bg-stone-100'
                }`}
              >
                Tier 2 (Heritage)
              </button>
              <button
                onClick={() => setSelectedTier('3')}
                className={`interactive-tap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTier === '3'
                    ? 'bg-[#A96C48] text-white font-extrabold shadow-xs'
                    : 'bg-[#FDFBF7] border border-[#E8DEC9] text-stone-600 hover:bg-stone-100'
                }`}
              >
                Tier 3 (Artisans & Food)
              </button>
            </div>

          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-[#E8DEC9]/60 scrollbar-none">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`interactive-tap px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4A121A] to-[#2B070C] text-[#F3D279] shadow-md border border-[#D4AF37]/50'
                      : 'bg-[#FDFBF7] hover:bg-stone-100 border border-[#E8DEC9] text-stone-700'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-[#F3D279]' : 'text-stone-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count & Current Status */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 font-medium px-1">
          <span>
            Showing <strong className="text-[#2B070C]">{filteredPlaces.length}</strong> of {places.length} curated Gwalior places
          </span>
          <span className="hidden sm:inline">
            Click <strong className="text-[#2B070C]">+ Add to Trip</strong> to stage places into your time-feasible route
          </span>
        </div>

        {/* Attraction Cards Grid */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPlaces.map((place) => {
              const isSelected = selectedPlaces.includes(place.id) || selectedPlaces.some(p => p?.id === place.id);

              return (
                <div
                  key={place.id}
                  className="group place-card rounded-3xl overflow-hidden bg-white border border-[#E8DEC9] shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  data-cursor="EXPLORE"
                >
                  {/* Card Image Header */}
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-stone-100">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#1C1617]/85 backdrop-blur-md text-xs uppercase font-bold tracking-wider text-[#F3D279] border border-[#D4AF37]/50 shadow-xs">
                        Tier {place.tier || 1}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#176B67]/95 backdrop-blur-md text-xs font-bold text-[#DDEDE8] border border-[#176B67]/50 flex items-center gap-1.5 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {place.hours ? 'Open Today' : 'ASI Verified'}
                      </span>
                    </div>

                    {/* Dwell Time & Distance Pill */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs sm:text-sm font-medium text-stone-200">
                      <span className="flex items-center gap-1.5 bg-[#1C1617]/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4 text-[#F3D279]" /> {place.duration} mins
                      </span>
                      <span className="flex items-center gap-1.5 bg-[#1C1617]/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                        <MapPin className="w-4 h-4 text-[#F3D279]" /> {place.distanceKm} km from Fort
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#8F690B]">
                          {place.category === 'sightseeing' ? 'Citadel & Monument' :
                           place.category === 'culture_music' ? 'Classical Heritage' :
                           place.category === 'handlooms' ? 'Handloom & Craft' : 'Heritage Cuisine'}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-stone-700 flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          {place.rating} ({place.reviews})
                        </span>
                      </div>

                      <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2B070C] leading-snug group-hover:text-[#8B1E2B] transition-colors">
                        {place.name}
                      </h3>
                      {place.hindiName && (
                        <p className="text-xs sm:text-sm text-stone-600 font-medium">
                          {place.hindiName}
                        </p>
                      )}

                      <p className="text-sm sm:text-[15px] text-stone-700 font-normal leading-relaxed line-clamp-3">
                        {place.description}
                      </p>
                    </div>

                    {/* Price & Operating Hours */}
                    <div className="pt-3 border-t border-[#E8DEC9] text-xs sm:text-sm text-stone-700 flex items-center justify-between">
                      <span className="font-bold text-[#2B070C]">{place.price || 'Free Entry'}</span>
                      <span className="text-xs text-stone-600 font-medium">{place.hours || '09:00 AM - 06:00 PM'}</span>
                    </div>

                    {/* Card Actions */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => onOpenAttraction(place)}
                        className="interactive-tap w-full py-3 px-3 rounded-xl bg-[#FDFBF7] hover:bg-[#F5EFEB] border border-[#E8DEC9] text-xs sm:text-sm font-bold text-[#2B070C] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        data-cursor="STORY"
                      >
                        <Eye className="w-4 h-4 text-[#C59B27]" />
                        <span>Story Details</span>
                      </button>

                      <button
                        onClick={() => togglePlaceSelection(place.id)}
                        className={`interactive-tap w-full py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#176B67] text-white shadow-md'
                            : 'bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3D279] hover:brightness-105 text-[#2B070C] shadow-md'
                        }`}
                        data-cursor={isSelected ? "REMOVE" : "ADD"}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>In Itinerary</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-[#2B070C]" />
                            <span>+ Add to Trip</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#E8DEC9] space-y-4">
            <Compass className="w-12 h-12 text-[#C59B27] mx-auto opacity-50" />
            <h3 className="font-display text-xl font-bold text-[#2B070C]">No Gwalior Places Found</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              We couldn't find any attractions matching "{searchQuery}". Try selecting "All Categories" or clearing the search bar.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTier('all');
              }}
              className="px-5 py-2.5 rounded-full bg-[#C59B27] text-[#2B070C] font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

