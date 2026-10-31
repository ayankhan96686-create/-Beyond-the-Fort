import { Landmark, Music, Heart, ShieldCheck, Compass, Route, Sparkles, Globe, Database } from 'lucide-react';

export default function Footer({
  setActiveTab,
  setIsLanguageModalOpen,
  setIsChatOpen,
  setIsAuditModalOpen,
  selectedLanguage = 'en'
}) {
  const scrollTo = (id, tab) => {
    if (tab && setActiveTab) setActiveTab(tab);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-gradient-to-b from-[#1C0407] via-[#2B070C] to-[#120204] text-[#FDFBF7] border-t-2 border-[#D4AF37]/40 relative overflow-hidden">
      
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-32 bg-[#C59B27]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 relative z-10 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand & UNESCO statement (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B1E2B] via-[#4A121A] to-[#1A0407] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg">
                <Landmark className="w-6 h-6 text-[#F3D279]" />
              </div>
              <div>
                <span className="font-display text-2xl font-bold tracking-tight text-[#FDFBF7] block">
                  Beyond the Fort
                </span>
                <span className="text-[11px] font-semibold text-[#F3D279] tracking-widest uppercase">
                  Gwalior Cultural Discovery AI
                </span>
              </div>
            </div>

            <p className="text-stone-300 text-sm leading-relaxed max-w-md font-light">
              An open, time-aware digital discoverability platform celebrating Gwalior's millennium of royal sandstone monuments, classical Tansen traditions, Chanderi weaving arts, and vibrant street cuisine.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 text-xs font-semibold text-[#F3D279]">
              <Music className="w-4 h-4 text-[#C59B27]" />
              <span>UNESCO Creative City of Music Member</span>
            </div>
          </div>

          {/* Column 2: Navigation & Exploration (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-base font-bold text-[#F3D279] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('hero', 'home')}
                  className="hover:text-[#F3D279] transition-colors cursor-pointer"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('heritage-pillars', 'pillars')}
                  className="hover:text-[#F3D279] transition-colors cursor-pointer"
                >
                  Four Heritage Pillars
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('discover-section', 'explore')}
                  className="hover:text-[#F3D279] transition-colors cursor-pointer"
                >
                  36 Curated Attractions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('planning-studio', 'plan')}
                  className="hover:text-[#F3D279] transition-colors cursor-pointer"
                >
                  Planning Studio & Time Feasibility
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (setIsChatOpen) setIsChatOpen(true);
                  }}
                  className="hover:text-[#F3D279] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F3D279]" />
                  <span>Tansen AI Concierge</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (setIsAuditModalOpen) setIsAuditModalOpen(true);
                  }}
                  className="hover:text-[#F3D279] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>Data Pack Governance Audit</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Authenticity & Open Data (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-display text-base font-bold text-[#F3D279] uppercase tracking-wider">
              Cultural Trust & Public Access
            </h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-stone-300 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-[#F3D279]">
                <ShieldCheck className="w-4 h-4 text-[#F3D279]" />
                <span>100% Public Access</span>
              </div>
              <p className="leading-relaxed text-[11px] text-stone-300">
                Beyond the Fort requires zero login, account creation, or payment. All itinerary planning algorithms and cultural archives are accessible to every traveller freely.
              </p>
            </div>

            <div className="text-[11px] text-stone-400 space-y-1">
              <p><strong>Authority Partners:</strong> Archaeological Survey of India (ASI) & Madhya Pradesh Tourism.</p>
              <p><strong>Photography:</strong> Curated high-resolution imagery via Wikimedia Commons & Unsplash under Creative Commons licensing.</p>
            </div>
          </div>

        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Beyond the Fort. Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for the cultural heritage of Gwalior.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (setIsLanguageModalOpen) setIsLanguageModalOpen(true);
              }}
              className="hover:text-[#F3D279] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>31 Languages Available</span>
            </button>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">
              Deterministic +25% Buffer Calibrated
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

