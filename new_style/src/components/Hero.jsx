import { ArrowDown, Compass, Route, ShieldCheck, Music, Sparkles, MapPin } from 'lucide-react';

export default function Hero({ onExploreClick, onPlanClick, totalPlacesCount = 36 }) {
  // Authentic high-resolution photography of Gwalior Fort & Man Singh Palace with its iconic sandstone citadels
  const heroImageUrl = "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2160&q=88";

  return (
    <section id="hero" className="relative w-full min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#1A0407]">
      
      {/* Authentic High-Resolution Photograph Background with Cinematic Zoom */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImageUrl}
          alt="Panoramic view of Gwalior Fort and Man Singh Palace towering on the sandstone cliff at sunset"
          className="w-full h-full object-cover object-center scale-105 animate-float opacity-80"
          loading="eager"
        />
        {/* Multilayered Warm Heritage Vignette & Sandstone Wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1617] via-[#2B070C]/60 to-[#1A0407]/40" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#2B070C]/40 to-[#1C1617]/90" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center text-[#FDFBF7] space-y-8 animate-fade-in-up">
        
        {/* Eyebrow / UNESCO City of Music Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A0407]/80 backdrop-blur-md border border-[#D4AF37]/50 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#F3D279] shadow-lg">
          <Music className="w-4 h-4 text-[#C59B27]" />
          <span>UNESCO City of Music • Madhya Pradesh, India</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* Editorial Heading */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#FDFBF7] leading-[1.08] drop-shadow-xl">
            Gwalior. <br className="hidden sm:inline" />
            <span className="italic font-serif-luxury font-normal text-[#F3D279]">A city that lives</span> in its stories.
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-stone-200 font-light leading-relaxed max-w-3xl mx-auto drop-shadow-md">
            Discover royal sandstone citadels, centuries of Hindustani ragas, living Chanderi handloom traditions, and time-aware itineraries crafted for your exact day.
          </p>
        </div>

        {/* Dual Primary Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pt-3">
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3D279] text-[#2B070C] font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer border border-[#FFF2CC] group"
          >
            <Compass className="w-5 h-5 text-[#2B070C] group-hover:rotate-45 transition-transform" />
            <span>Explore Gwalior</span>
            <span className="text-sm opacity-80">({totalPlacesCount} Places)</span>
          </button>

          <button
            onClick={onPlanClick}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2B070C]/80 hover:bg-[#4A121A]/95 text-[#FDFBF7] hover:text-[#F3D279] font-bold text-base shadow-xl backdrop-blur-md border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Route className="w-5 h-5 text-[#F3D279]" />
            <span>Plan Your Journey</span>
            <span className="text-xs bg-[#D4AF37]/20 text-[#F3D279] px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
              25% Transit Buffer
            </span>
          </button>
        </div>

        {/* Heritage Trust Badges */}
        <div className="pt-8 sm:pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto text-left">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1A0407]/75 backdrop-blur-md border border-[#D4AF37]/30 flex items-center gap-3.5 shadow-md">
            <ShieldCheck className="w-6 h-6 text-[#14B8A6] shrink-0" />
            <div>
              <div className="font-bold text-sm sm:text-base text-[#FDFBF7]">ASI Certified</div>
              <div className="text-xs text-stone-300 font-medium">Audited monuments</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#1A0407]/75 backdrop-blur-md border border-[#D4AF37]/30 flex items-center gap-3.5 shadow-md">
            <Music className="w-6 h-6 text-[#F3D279] shrink-0" />
            <div>
              <div className="font-bold text-sm sm:text-base text-[#FDFBF7]">Gwalior Gharana</div>
              <div className="text-xs text-stone-300 font-medium">Birthplace of Dhrupad</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#1A0407]/75 backdrop-blur-md border border-[#D4AF37]/30 flex items-center gap-3.5 shadow-md">
            <Route className="w-6 h-6 text-[#F3D279] shrink-0" />
            <div>
              <div className="font-bold text-sm sm:text-base text-[#FDFBF7]">Time-Aware AI</div>
              <div className="text-xs text-stone-300 font-medium">Exact dwell & transit</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#1A0407]/75 backdrop-blur-md border border-[#D4AF37]/30 flex items-center gap-3.5 shadow-md">
            <Sparkles className="w-6 h-6 text-[#14B8A6] shrink-0" />
            <div>
              <div className="font-bold text-sm sm:text-base text-[#FDFBF7]">100% Free & Public</div>
              <div className="text-xs text-stone-300 font-medium">No account required</div>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
        <span className="text-[10px] tracking-widest uppercase font-semibold text-[#F3D279]">
          Scroll to Discover
        </span>
        <button
          onClick={onExploreClick}
          className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center animate-bounce text-[#F3D279] hover:bg-[#D4AF37]/20 cursor-pointer"
          aria-label="Scroll to attractions"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
}

