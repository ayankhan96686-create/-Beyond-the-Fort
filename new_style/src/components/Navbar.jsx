import { useState, useEffect } from 'react';
import {
  Landmark, Route, Globe, Menu, X, Sparkles, Volume2, VolumeX, Compass, MapPin, Database
} from 'lucide-react';
import { LANGUAGES_LIST } from '../translations';

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setIsLanguageModalOpen,
  selectedPlacesCount,
  setIsChatOpen,
  isAudioPlaying,
  toggleAudio,
  setIsAuditModalOpen,
  t
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentLang = LANGUAGES_LIST.find(l => l.code === selectedLanguage) || { flag: '🌐', native: 'English' };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || activeTab !== 'home'
          ? 'bg-[#2B070C]/98 backdrop-blur-md shadow-xl py-3 border-b border-[#D4AF37]/35'
          : 'bg-gradient-to-b from-[#1C0407]/92 via-[#2B070C]/75 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Identity */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3.5 group cursor-pointer text-left focus:outline-none"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8B1E2B] via-[#4A121A] to-[#1A0407] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:border-[#F3D279] transition-all shrink-0">
              <Landmark className="w-6 h-6 text-[#F3D279]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#FDFBF7] group-hover:text-[#F3D279] transition-colors">
                  Beyond the Fort
                </span>
                <span className="hidden sm:inline-block text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/30 text-[#F3D279] border border-[#D4AF37]/50">
                  Gwalior
                </span>
              </div>
              <p className="text-xs font-medium tracking-wide text-stone-200 hidden sm:block">
                UNESCO City of Music • Living Heritage & Time-Aware Discovery
              </p>
            </div>
          </a>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A0407]/75 backdrop-blur-md border border-[#D4AF37]/35 shadow-inner text-sm font-semibold">
            <button
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#C59B27] text-[#2B070C] font-bold shadow-md'
                  : 'text-[#FDFBF7] hover:text-[#F3D279] hover:bg-white/10'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('explore');
                const el = document.getElementById('discover-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'explore' || activeTab === 'discover'
                  ? 'bg-[#C59B27] text-[#2B070C] font-bold shadow-md'
                  : 'text-[#FDFBF7] hover:text-[#F3D279] hover:bg-white/10'
              }`}
            >
              Discover Places
            </button>
            <button
              onClick={() => {
                setActiveTab('plan');
                const el = document.getElementById('planning-studio') || document.getElementById('planner-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'plan' || activeTab === 'planner'
                  ? 'bg-[#C59B27] text-[#2B070C] font-bold shadow-md'
                  : 'text-[#FDFBF7] hover:text-[#F3D279] hover:bg-white/10'
              }`}
            >
              Planning Studio
            </button>
            <button
              onClick={() => {
                setActiveTab('route');
                const el = document.getElementById('route-section') || document.getElementById('itinerary-results');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'route'
                  ? 'bg-[#C59B27] text-[#2B070C] font-bold shadow-md'
                  : 'text-[#FDFBF7] hover:text-[#F3D279] hover:bg-white/10'
              }`}
            >
              Itinerary & Map
            </button>
            <button
              onClick={() => {
                setActiveTab('agents');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'agents'
                  ? 'bg-[#C59B27] text-[#2B070C] font-bold shadow-md'
                  : 'text-[#FDFBF7] hover:text-[#F3D279] hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Agents (6)</span>
            </button>
          </nav>

          {/* Right Controls: Tourist Actions (No Login / No Account) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Data Pack Governance Audit */}
            {setIsAuditModalOpen && (
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A0407]/80 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/45 text-xs font-semibold text-[#F3D279] transition-all cursor-pointer shadow-xs"
                title="View Tourism AI Data Quality & Provenance Audit"
              >
                <Database className="w-3.5 h-3.5 text-[#C59B27]" />
                <span className="text-[11px]">Data Audit</span>
              </button>
            )}
            
            {/* Audio Ambience Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAudioPlaying
                  ? 'bg-[#0F766E]/80 border-[#14B8A6] text-[#F0FDFA] shadow-md shadow-teal-900/40'
                  : 'bg-[#1A0407]/80 border-[#D4AF37]/40 text-[#F3D279] hover:bg-[#D4AF37]/20'
              }`}
              title={isAudioPlaying ? "Mute Classical Sangeet Ambience" : "Play Classical Sangeet Ambience"}
              aria-label="Toggle ambient heritage music"
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="hidden xl:inline text-[11px]">Raag Playing</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 opacity-70" />
                  <span className="hidden xl:inline text-[11px]">Sangeet</span>
                </>
              )}
            </button>

            {/* Language Picker */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A0407]/80 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/45 text-xs font-bold text-[#F3D279] transition-all cursor-pointer shadow-xs"
              title="Select Language (31 Available)"
            >
              <span className="text-sm leading-none">{currentLang.flag}</span>
              <span className="hidden sm:inline font-semibold">{currentLang.native}</span>
            </button>

            {/* Saved Itinerary Pill */}
            <button
              onClick={() => {
                setActiveTab('planner');
                const el = document.getElementById('planner-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#4A121A] to-[#2B070C] hover:from-[#681C26] hover:to-[#4A121A] border border-[#D4AF37]/60 text-xs font-bold text-[#FDFBF7] transition-all shadow-md cursor-pointer group"
              title="View your trip stops"
            >
              <Route className="w-4 h-4 text-[#F3D279] group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline text-[#FDFBF7]">Trip Bag:</span>
              <span className="bg-[#C59B27] text-[#2B070C] px-2 py-0.5 rounded-full text-xs font-extrabold">
                {selectedPlacesCount}
              </span>
            </button>

            {/* Ask Tansen AI Button */}
            <button
              onClick={() => setIsChatOpen(prev => !prev)}
              className="relative flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3D279] text-[#2B070C] font-bold text-xs sm:text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer border border-[#FFF2CC]"
            >
              <Sparkles className="w-4 h-4 text-[#2B070C]" />
              <span className="font-display tracking-tight">Ask Tansen</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl bg-[#1A0407]/90 border border-[#D4AF37]/50 text-[#F3D279] hover:bg-[#D4AF37]/20 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 rounded-2xl bg-[#2B070C]/98 border border-[#D4AF37]/40 p-4 space-y-3 shadow-2xl backdrop-blur-xl animate-fade-in">
            <button
              onClick={() => {
                setActiveTab('home');
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#FDFBF7] hover:bg-white/10 flex items-center gap-2.5"
            >
              <Compass className="w-4 h-4 text-[#F3D279]" />
              Home Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('discover');
                setIsMobileMenuOpen(false);
                const el = document.getElementById('discover-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#FDFBF7] hover:bg-white/10 flex items-center gap-2.5"
            >
              <MapPin className="w-4 h-4 text-[#F3D279]" />
              Discover 36 Attractions
            </button>
            <button
              onClick={() => {
                setActiveTab('planner');
                setIsMobileMenuOpen(false);
                const el = document.getElementById('planner-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#FDFBF7] hover:bg-white/10 flex items-center gap-2.5"
            >
              <Route className="w-4 h-4 text-[#F3D279]" />
              Plan Your Visit (With 25% Transit Buffer)
            </button>
            <button
              onClick={() => {
                setActiveTab('route');
                setIsMobileMenuOpen(false);
                const el = document.getElementById('route-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#FDFBF7] hover:bg-white/10 flex items-center gap-2.5"
            >
              <Landmark className="w-4 h-4 text-[#F3D279]" />
              Itinerary & Timeline ({selectedPlacesCount} Stops)
            </button>
            <button
              onClick={() => {
                setActiveTab('agents');
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#FDFBF7] hover:bg-white/10 flex items-center gap-2.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              6-Agent LangGraph System
            </button>
            <div className="pt-2 border-t border-[#D4AF37]/30 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsLanguageModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-xs font-bold text-[#F3D279] hover:underline"
              >
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                Language: {currentLang.native}
              </button>
              <span className="text-[11px] text-stone-400">100% Public Access</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
