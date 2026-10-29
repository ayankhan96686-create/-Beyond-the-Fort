import {
  Landmark, Route, User, Globe, Menu, X, Sparkles
} from 'lucide-react';
import { LANGUAGES_LIST } from '../translations';

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setIsLanguageModalOpen,
  setLanguageSearch,
  selectedPlacesCount,
  userAuth,
  setIsAuthModalOpen,
  setIsChatOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  t
}) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#350d0e]/95 backdrop-blur-md shadow-md border-b border-[#d4af37]/30">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="w-full flex items-center justify-between h-18">
          
          {/* Logo & Royal Crest */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-linear-to-br from-[#8B0000] to-[#240809] border border-[#D4AF37] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5D77F]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-heritage text-base sm:text-xl font-bold tracking-tight text-[#F5D77F] truncate">
                  {t('brandTitle')}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D77F] font-bold border border-[#D4AF37]/40">
                  Gwalior
                </span>
              </div>
              <p className="text-[11px] text-stone-300 hidden sm:block truncate">
                {t('cityTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#240809]/80 p-1.5 rounded-full border border-[#D4AF37]/40 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#D4AF37] text-[#350d0e] font-bold shadow-xs'
                  : 'text-stone-300 hover:text-[#F5D77F] hover:bg-white/10'
              }`}
            >
              {t('navDashboard')}
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-[#D4AF37] text-[#350d0e] font-bold shadow-xs'
                  : 'text-stone-300 hover:text-[#F5D77F] hover:bg-white/10'
              }`}
            >
              {t('navExplore')}
            </button>
            <button
              onClick={() => setActiveTab('route')}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'route'
                  ? 'bg-[#D4AF37] text-[#350d0e] font-bold shadow-xs'
                  : 'text-stone-300 hover:text-[#F5D77F] hover:bg-white/10'
              }`}
            >
              {t('navMap')}
            </button>
          </nav>

          {/* Right Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Dynamic Language Modal Button (31 Languages) */}
            <button
              onClick={() => {
                setLanguageSearch('');
                setIsLanguageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#240809]/80 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-xs font-bold text-[#F5D77F] transition-colors shadow-2xs cursor-pointer"
              title="Select Language (31 Languages Available)"
            >
              <span className="text-sm leading-none">{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.flag || '🌐'}</span>
              <span className="font-semibold">{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.native || 'English'}</span>
            </button>

            {/* Active Route Pill */}
            <button
              onClick={() => setActiveTab('route')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#240809]/80 hover:bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/40 text-xs font-semibold transition-colors cursor-pointer"
              title="View Itinerary"
            >
              <Route className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span className="hidden sm:inline">{t('routeBadge')}:</span>
              <span className="bg-[#D4AF37] text-[#350d0e] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {selectedPlacesCount}
              </span>
            </button>

            {/* User Account / Pass Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#240809]/80 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-semibold text-[#F5D77F] transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="truncate max-w-[110px]">
                {userAuth.isLoggedIn ? (selectedLanguage === 'hi' ? userAuth.nameHi : userAuth.name) : t('navAccount')}
              </span>
              {userAuth.isLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Chatbot Header Button */}
            <button
              onClick={() => setIsChatOpen(prev => !prev)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-[#8B0000] to-[#AA820A] border border-[#D4AF37]/50 text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span className="hidden sm:inline">{t('tansenAI')}</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5D77F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl bg-[#240809]/80 border border-[#D4AF37]/40 text-[#F5D77F] cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navbar */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#350d0e] border-t border-[#D4AF37]/40 px-4 py-3 space-y-2 shadow-2xl">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#D4AF37] text-[#350d0e]' : 'text-stone-200 hover:bg-[#240809] hover:text-[#F5D77F]'
            }`}
          >
            {t('navDashboard')}
          </button>
          <button
            onClick={() => {
              setActiveTab('explore');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'explore' ? 'bg-[#D4AF37] text-[#350d0e]' : 'text-stone-200 hover:bg-[#240809] hover:text-[#F5D77F]'
            }`}
          >
            {t('navExplore')}
          </button>
          <button
            onClick={() => {
              setActiveTab('route');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'route' ? 'bg-[#D4AF37] text-[#350d0e]' : 'text-stone-200 hover:bg-[#240809] hover:text-[#F5D77F]'
            }`}
          >
            {t('navMap')}
          </button>
          <button
            onClick={() => {
              setIsAuthModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#F5D77F] bg-[#240809] border border-[#D4AF37]/30 flex items-center justify-between cursor-pointer"
          >
            <span>{userAuth.isLoggedIn ? (selectedLanguage === 'hi' ? userAuth.nameHi : userAuth.name) : t('navAccount')}</span>
            <User className="w-4 h-4 text-[#D4AF37]" />
          </button>
          <button
            onClick={() => {
              setLanguageSearch('');
              setIsLanguageModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#F5D77F] bg-[#240809] border border-[#D4AF37]/30 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.flag || '🌐'}</span>
              <span>{t('selectLangTitle')} ({LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.native || 'English'})</span>
            </div>
            <Globe className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      )}
    </header>
  );
}

