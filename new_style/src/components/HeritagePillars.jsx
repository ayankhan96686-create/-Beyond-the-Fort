import { Landmark, Music, ShoppingBag, UtensilsCrossed, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export default function HeritagePillars({ onSelectCategory, onOpenAttraction, places = [] }) {
  const fortSpot = places.find(p => p.id === 'gw-mon-1') || {
    name: 'Gwalior Fort & Man Singh Palace',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    description: 'The "Pearl among fortresses of Hind". Renowned for vibrant turquoise duck and elephant enameled wall tiles, rock-cut palaces, and panoramic cliffside vistas.'
  };

  const palaceSpot = places.find(p => p.id === 'gw-mon-2') || {
    name: 'Jai Vilas Palace & Scindia Museum',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    description: '19th-century royal European palace with the world’s two largest crystal chandeliers weighing 3.5 tons each, and the legendary silver banquet dining train.'
  };

  const tansenSpot = places.find(p => p.id === 'gw-mon-3') || {
    name: 'Tomb of Mohammad Ghaus & Tansen Samadhi',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    description: 'Resting place of Sangeet Samrat Tansen, the legendary gem of Akbar’s court, and Sufi saint Mohammad Ghaus. The tamarind tree here is said to sweeten one’s singing voice.'
  };

  const weaversSpot = places.find(p => p.id === 'gw-craft-1' || p.category === 'handlooms') || {
    name: 'Kripalpur Chanderi Weavers Cluster',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg/960px-Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg',
    description: 'Master artisans weaving genuine Chanderi silk and cotton sarees with gold zari borders on centuries-old pit looms.'
  };

  return (
    <section className="w-full py-20 sm:py-28 bg-[#FDFBF7] text-[#1C1617] border-b border-[#E8DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header with Editorial Flourish */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8DEC9] pb-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C59B27]">
              <span>✳</span> Four Cultural Pillars
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2B070C] tracking-tight leading-tight">
              The Soul of Gwalior in Four Chapters.
            </h2>
            <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed">
              Every sandstone carve, classical swara, silk thread, and heritage recipe carries a legacy that transcends centuries.
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono-numbers text-3xl font-extrabold text-[#C59B27]">1,200+</span>
            <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Years of Documented Heritage</p>
          </div>
        </div>

        {/* Asymmetrical Editorial Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Pillar 1: Gwalior Fort (Large 7-Col Feature) */}
          <div
            onClick={() => onOpenAttraction(fortSpot)}
            className="lg:col-span-7 group relative rounded-3xl overflow-hidden shadow-xl border border-[#E8DEC9] bg-[#2B070C] cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5"
          >
            <div className="h-80 sm:h-[440px] w-full overflow-hidden relative">
              <img
                src={fortSpot.image}
                alt={fortSpot.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1617] via-[#2B070C]/50 to-transparent" />
              
              <div className="absolute top-5 left-5">
                <span className="px-3.5 py-1.5 rounded-full bg-[#C59B27] text-[#2B070C] font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" /> Iconic Fortress
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-gradient-to-b from-[#2B070C]/90 to-[#1C1617] text-[#FDFBF7] space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#F3D279] font-medium">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 90 min visit</span>
                <span>•</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ASI Certified</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FDFBF7] group-hover:text-[#F3D279] transition-colors">
                {fortSpot.name}
              </h3>
              <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
                {fortSpot.description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#F3D279] group-hover:gap-3 transition-all">
                <span>Explore the citadel's secret chambers & tile mosaics</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Pillar 2: Jai Vilas Palace (5-Col Feature) */}
          <div
            onClick={() => onOpenAttraction(palaceSpot)}
            className="lg:col-span-5 group relative rounded-3xl overflow-hidden shadow-xl border border-[#E8DEC9] bg-[#2B070C] cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col"
          >
            <div className="h-64 sm:h-72 w-full overflow-hidden relative">
              <img
                src={palaceSpot.image}
                alt={palaceSpot.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1617] via-[#2B070C]/40 to-transparent" />
              
              <div className="absolute top-5 left-5">
                <span className="px-3.5 py-1.5 rounded-full bg-[#0F766E] text-white font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#14B8A6]" /> Royal Palace
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#2B070C]/90 to-[#1C1617] text-[#FDFBF7] space-y-3">
              <div>
                <div className="text-xs text-[#F3D279] font-medium mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 75 min visit • Scindia Trust
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FDFBF7] group-hover:text-[#F3D279] transition-colors">
                  {palaceSpot.name}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-light mt-2 leading-relaxed">
                  {palaceSpot.description}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#F3D279] group-hover:gap-3 transition-all">
                <span>View Durbar Hall & Dining Train</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Pillar 3: Tansen Classical Music Samadhi (5-Col Feature) */}
          <div
            onClick={() => onOpenAttraction(tansenSpot)}
            className="lg:col-span-5 group relative rounded-3xl overflow-hidden shadow-xl border border-[#E8DEC9] bg-[#2B070C] cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col"
          >
            <div className="h-64 sm:h-72 w-full overflow-hidden relative">
              <img
                src={tansenSpot.image}
                alt={tansenSpot.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1617] via-[#2B070C]/40 to-transparent" />
              
              <div className="absolute top-5 left-5">
                <span className="px-3.5 py-1.5 rounded-full bg-[#4A121A] text-[#F3D279] border border-[#D4AF37]/50 font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" /> Classical Heritage
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#2B070C]/90 to-[#1C1617] text-[#FDFBF7] space-y-3">
              <div>
                <div className="text-xs text-[#F3D279] font-medium mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 45 min visit • Free Entry
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FDFBF7] group-hover:text-[#F3D279] transition-colors">
                  {tansenSpot.name}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-light mt-2 leading-relaxed">
                  {tansenSpot.description}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#F3D279] group-hover:gap-3 transition-all">
                <span>Hear the story of the magical tamarind tree</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Pillar 4: Chanderi Weavers & Bazaars (7-Col Feature) */}
          <div
            onClick={() => onOpenAttraction(weaversSpot)}
            className="lg:col-span-7 group relative rounded-3xl overflow-hidden shadow-xl border border-[#E8DEC9] bg-[#2B070C] cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5"
          >
            <div className="h-64 sm:h-72 w-full overflow-hidden relative">
              <img
                src={weaversSpot.image}
                alt={weaversSpot.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1617] via-[#2B070C]/40 to-transparent" />
              
              <div className="absolute top-5 left-5">
                <span className="px-3.5 py-1.5 rounded-full bg-[#C59B27] text-[#2B070C] font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" /> Living Craft Heritage
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-gradient-to-b from-[#2B070C]/90 to-[#1C1617] text-[#FDFBF7] space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#F3D279] font-medium">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 45 min visit</span>
                <span>•</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Direct Artisan Purchase</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FDFBF7] group-hover:text-[#F3D279] transition-colors">
                {weaversSpot.name}
              </h3>
              <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
                {weaversSpot.description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#F3D279] group-hover:gap-3 transition-all">
                <span>Witness live traditional pit loom demonstrations</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

