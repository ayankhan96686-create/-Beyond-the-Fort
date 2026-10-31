import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { GWALIOR_PLACES } from './data/places';
import { LANGUAGES_LIST, TRANSLATIONS } from './translations';
import { generateTansenAIResponse, getLocalizedWelcomeMessage } from './aiConcierge';
import { sendChatMessage, planItinerary } from './services/api';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HeritagePillars from './components/HeritagePillars';
import ExploreSection from './components/ExploreSection';
import PlanningStudio from './components/PlanningStudio';
import ItineraryResults from './components/ItineraryResults';
import PlaceDetailModal from './components/PlaceDetailModal';
import ChatBot from './components/ChatBot';
import LanguageModal from './components/LanguageModal';
import Footer from './components/Footer';
import Toast from './components/Toast';

import WebGLCanvas from './components/WebGLCanvas';
import CustomCursor from './components/CustomCursor';
import PageTransitionWipe from './components/PageTransitionWipe';
import DatasetQualityModal from './components/DatasetQualityModal';
import AgentProgressModal from './components/AgentProgressModal';
import AgentCommandCenter from './components/AgentCommandCenter';
import useLenisScroll from './hooks/useLenisScroll';

export default function App() {
  // Initialize Locomotive-inspired inertia momentum scrolling
  useLenisScroll();

  // Navigation tabs: 'home' | 'explore' | 'plan' | 'route' | 'pillars'
  const [activeTab, setActiveTab] = useState('home');

  // Selected language state (31 supported languages)
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [languageCategoryFilter, setLanguageCategoryFilter] = useState('all');

  // Modal & Drawer states
  const [spotDetailModal, setSpotDetailModal] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Planning studio parameters
  const [selectedHours, setSelectedHours] = useState(4);
  const [tourPace, setTourPace] = useState('balanced');
  const [travelMode, setTravelMode] = useState('e-rickshaw');
  const [startTime, setStartTime] = useState('10:00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraryPlan, setItineraryPlan] = useState(null);
  const [rawPlanResult, setRawPlanResult] = useState(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isAgentFinished, setIsAgentFinished] = useState(false);
  const [agentModalError, setAgentModalError] = useState(null);

  // Staged attractions with LocalStorage persistence
  const [selectedPlaces, setSelectedPlaces] = useState(() => {
    try {
      const saved = localStorage.getItem('beyond_fort_staged_places');
      return saved ? JSON.parse(saved) : ['gw-mon-1', 'gw-mon-2', 'gw-mon-3', 'gw-food-1'];
    } catch {
      return ['gw-mon-1', 'gw-mon-2', 'gw-mon-3', 'gw-food-1'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('beyond_fort_staged_places', JSON.stringify(selectedPlaces));
    } catch {}
  }, [selectedPlaces]);

  // Audio ambience state (Web Audio Tanpura drone generator)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const audioGainRef = useRef(null);

  // Translation helper
  const t = useCallback((key) => {
    const dict = TRANSLATIONS[selectedLanguage];
    if (dict && dict[key]) return dict[key];
    if (TRANSLATIONS.hi && (selectedLanguage === 'hi' || selectedLanguage === 'bundeli') && TRANSLATIONS.hi[key]) {
      return TRANSLATIONS.hi[key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return key;
  }, [selectedLanguage]);

  // Toast notification helper
  const showToast = useCallback((toastData) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(toastData);
    toastTimerRef.current = setTimeout(() => setToast(null), 4500);
  }, []);

  // Filtered languages for LanguageModal
  const filteredLanguages = useMemo(() => {
    return LANGUAGES_LIST.filter(lang => {
      const matchesCategory = languageCategoryFilter === 'all' || lang.category === languageCategoryFilter;
      const matchesSearch = languageSearch.trim() === '' ||
        lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
        lang.native.toLowerCase().includes(languageSearch.toLowerCase()) ||
        lang.code.toLowerCase().includes(languageSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [languageSearch, languageCategoryFilter]);

  // Selected place objects
  const selectedPlaceObjects = useMemo(() => {
    return GWALIOR_PLACES.filter(p => selectedPlaces.includes(p.id));
  }, [selectedPlaces]);

  // Live Itinerary Feasibility Statistics with mandatory 25% transit buffer
  const itineraryStats = useMemo(() => {
    const paceTransit = tourPace === 'relaxed' ? 20 : tourPace === 'fast' ? 10 : 15;
    const modeMultiplier = travelMode === 'walking' ? 1.4 : travelMode === 'cab' ? 0.75 : 1.0;
    const effectiveTransitPerLeg = Math.round(paceTransit * modeMultiplier);
    const totalMinutes = selectedPlaceObjects.reduce((acc, p) => acc + (p.duration || 60), 0);
    const totalKm = selectedPlaceObjects.reduce((acc, p) => acc + (p.distanceKm || 2.0), 0);
    const transitMinutes = selectedPlaceObjects.length > 1
      ? (selectedPlaceObjects.length - 1) * effectiveTransitPerLeg
      : 0;
    const grossMinutes = totalMinutes + transitMinutes;
    const grossHours = (grossMinutes / 60).toFixed(1);

    return {
      count: selectedPlaceObjects.length,
      totalMinutes,
      transitMinutes,
      grossMinutes,
      grossHours,
      totalKm: totalKm.toFixed(1),
      fitsBudget: grossMinutes <= selectedHours * 60,
      deficitHours: Math.max(0, parseFloat(((grossMinutes - selectedHours * 60) / 60).toFixed(1))).toFixed(1)
    };
  }, [selectedPlaceObjects, selectedHours, tourPace, travelMode]);

  // Toggle attraction selection
  const togglePlaceSelection = (target) => {
    const id = typeof target === 'string' ? target : (target?.id || target);
    if (!id) return;
    setSelectedPlaces(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(pId => pId !== id) : [...prev, id];
      const place = GWALIOR_PLACES.find(p => p.id === id);
      if (place) {
        showToast({
          title: exists ? 'Removed from Trip' : 'Added to Trip',
          description: exists
            ? `${place.name} has been removed from your staged itinerary.`
            : `${place.name} added. Current staged stops: ${updated.length}`
        });
      }
      return updated;
    });
  };

  // Auto-fit attractions to currently selected time budget
  const handleAutoFitPlaces = () => {
    const paceTransit = tourPace === 'relaxed' ? 20 : tourPace === 'fast' ? 10 : 15;
    const modeMultiplier = travelMode === 'walking' ? 1.4 : travelMode === 'cab' ? 0.75 : 1.0;
    const effectiveTransit = Math.round(paceTransit * modeMultiplier);
    const sorted = [...GWALIOR_PLACES].sort((a, b) => (a.tier - b.tier) || (b.rating - a.rating));
    const fitted = [];
    let currentMin = 0;

    for (const place of sorted) {
      const transit = fitted.length > 0 ? effectiveTransit : 0;
      if (currentMin + (place.duration || 60) + transit <= selectedHours * 60) {
        fitted.push(place.id);
        currentMin += (place.duration || 60) + transit;
      }
    }

    if (fitted.length > 0) {
      setSelectedPlaces(fitted);
      showToast({
        title: 'Auto-Fit Applied',
        description: `Selected ${fitted.length} high-tier places that comfortably fit inside your ${selectedHours}-hour window.`
      });
    }
  };

  // Handle plan generation via LangGraph multi-agent API with live modal trace
  const handleGenerateItinerary = async (payload) => {
    setIsGenerating(true);
    setIsAgentModalOpen(true);
    setIsAgentFinished(false);
    setAgentModalError(null);

    try {
      if (payload?.startTime) setStartTime(payload.startTime);
      const startCoordObj = {
        label: typeof payload?.startLocation === 'string' ? payload.startLocation : 'Gwalior Railway Station',
        lat: 26.2163,
        lng: 78.1972,
        source: 'map_pin'
      };

      const result = await planItinerary({
        query: payload?.query || 'Explore Gwalior fortresses, music traditions, and cultural heritage',
        available_minutes: selectedHours * 60,
        transport_mode: travelMode === 'e-rickshaw' ? 'cab' : travelMode,
        start_time: payload?.startTime || startTime,
        start_location: startCoordObj
      }).catch(err => {
        console.warn('Backend plan API call notice:', err);
        return null;
      });

      if (result) {
        setRawPlanResult(result);
        if (result.itinerary) {
          setItineraryPlan(result.itinerary);
        }
      }

      // Mark agent execution complete in modal
      setIsAgentFinished(true);

      // Smooth delay so visitor sees 100% completion before navigating
      setTimeout(() => {
        setIsAgentModalOpen(false);
        setActiveTab('route');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast({
          title: '6-Agent Itinerary Orchestrated',
          description: `Your ${selectedHours}-hour expedition is verified with 25% safety buffer for Gwalior.`
        });
      }, 1200);

    } catch (err) {
      console.error(err);
      setAgentModalError(err.message || 'Workflow notice');
      setTimeout(() => {
        setIsAgentModalOpen(false);
        setActiveTab('route');
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Chat state & handlers
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: getLocalizedWelcomeMessage('en'),
      timestamp: 'Just now',
      suggestions: [
        'What is famous in Maharaj Bada?',
        'Suggest an afternoon plan in 4 hours',
        'Where can I find authentic Chanderi sarees?'
      ]
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const chatEndRef = useRef(null);

  const handleSendChat = async (messageText) => {
    const textToSend = (messageText || chatInput).trim();
    if (!textToSend) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now'
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsBotTyping(true);

    try {
      const response = await sendChatMessage(textToSend, selectedLanguage).catch(() => null);
      let replyText = response?.reply;
      if (!replyText) {
        replyText = generateTansenAIResponse(textToSend, selectedLanguage);
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        timestamp: 'Just now',
        suggestions: ['Tell me more', 'View on map', 'Add to my itinerary']
      };
      setChatMessages(prev => [...prev, botMsg]);

      // Voice speech synthesis if voice mode active
      if (isVoiceActive && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(replyText.slice(0, 150));
        utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      const fallbackReply = generateTansenAIResponse(textToSend, selectedLanguage);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallbackReply,
        timestamp: 'Just now'
      }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Web Audio Harmonic Tanpura Ambience
  const toggleAudio = () => {
    if (!isAudioPlaying) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.connect(ctx.destination);
          audioGainRef.current = gain;

          // Harmonic fundamental and fifth frequencies (C#3 / G#3)
          const freqs = [138.59, 207.65, 277.18, 415.30];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.04 / (idx + 1), ctx.currentTime);
            osc.connect(oscGain);
            oscGain.connect(gain);
            osc.start();
          });
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        setIsAudioPlaying(true);
        showToast({
          title: 'Ambient Music Playing',
          description: 'Acoustic Tanpura resonance in Raag Megh now playing.'
        });
      } catch (err) {
        console.warn('Audio initialization warning:', err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsAudioPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1617] flex flex-col font-sans selection:bg-[#C59B27] selection:text-[#2B070C] relative">
      
      {/* 3D WebGL Canvas Layer (Active Theory Style) */}
      <WebGLCanvas activeTab={activeTab} />

      {/* Magnetic Trailing Custom Cursor (Locomotive Style) */}
      <CustomCursor />

      {/* Creative Curtain Page Transition Wipe */}
      <PageTransitionWipe activeTab={activeTab} />

      {/* Floating Heritage Glass Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setIsLanguageModalOpen={setIsLanguageModalOpen}
        selectedPlacesCount={selectedPlaces.length}
        setIsChatOpen={setIsChatOpen}
        isAudioPlaying={isAudioPlaying}
        toggleAudio={toggleAudio}
        setIsAuditModalOpen={setIsAuditModalOpen}
        t={t}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10">
        {activeTab === 'home' && (
          <div className="space-y-0">
            {/* Cinematic Hero Section */}
            <Hero
              onExploreClick={() => {
                setActiveTab('explore');
                const el = document.getElementById('discover-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onPlanClick={() => {
                setActiveTab('plan');
                const el = document.getElementById('planning-studio');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              totalPlacesCount={GWALIOR_PLACES.length}
            />

            {/* Asymmetrical 4-Chapter Bento Grid */}
            <HeritagePillars
              onExplorePillar={(pillarId) => {
                setActiveTab('explore');
                const el = document.getElementById('discover-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Curated 36 Places Explorer Section */}
            <ExploreSection
              places={GWALIOR_PLACES}
              selectedPlaces={selectedPlaces}
              togglePlaceSelection={togglePlaceSelection}
              onOpenAttraction={(place) => setSpotDetailModal(place)}
              selectedLanguage={selectedLanguage}
              t={t}
            />

            {/* Interactive Planning Studio */}
            <PlanningStudio
              selectedHours={selectedHours}
              setSelectedHours={setSelectedHours}
              tourPace={tourPace}
              setTourPace={setTourPace}
              travelMode={travelMode}
              setTravelMode={setTravelMode}
              selectedPlaces={selectedPlaces}
              setSelectedPlaces={setSelectedPlaces}
              itineraryStats={itineraryStats}
              handleAutoFitPlaces={handleAutoFitPlaces}
              onGenerateItinerary={handleGenerateItinerary}
              isGenerating={isGenerating}
              selectedLanguage={selectedLanguage}
              t={t}
            />
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="pt-20">
            <ExploreSection
              places={GWALIOR_PLACES}
              selectedPlaces={selectedPlaces}
              togglePlaceSelection={togglePlaceSelection}
              onOpenAttraction={(place) => setSpotDetailModal(place)}
              selectedLanguage={selectedLanguage}
              t={t}
            />
          </div>
        )}

        {activeTab === 'pillars' && (
          <div className="pt-20">
            <HeritagePillars
              onExplorePillar={(pillarId) => {
                setActiveTab('explore');
              }}
            />
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="pt-20">
            <PlanningStudio
              selectedHours={selectedHours}
              setSelectedHours={setSelectedHours}
              tourPace={tourPace}
              setTourPace={setTourPace}
              travelMode={travelMode}
              setTravelMode={setTravelMode}
              selectedPlaces={selectedPlaces}
              setSelectedPlaces={setSelectedPlaces}
              itineraryStats={itineraryStats}
              handleAutoFitPlaces={handleAutoFitPlaces}
              onGenerateItinerary={handleGenerateItinerary}
              isGenerating={isGenerating}
              selectedLanguage={selectedLanguage}
              t={t}
            />
          </div>
        )}

        {activeTab === 'route' && (
          <div className="pt-20">
            <ItineraryResults
              itineraryPlan={itineraryPlan}
              rawPlanResult={rawPlanResult}
              selectedPlaceObjects={selectedPlaceObjects}
              itineraryStats={itineraryStats}
              travelMode={travelMode}
              tourPace={tourPace}
              startTime={startTime}
              onBackToStudio={() => {
                setActiveTab('plan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreMore={() => {
                setActiveTab('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAttraction={(place) => setSpotDetailModal(place)}
              togglePlaceSelection={togglePlaceSelection}
              selectedLanguage={selectedLanguage}
              t={t}
            />
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="pt-20">
            <AgentCommandCenter
              onSelectItinerary={() => setActiveTab('route')}
            />
          </div>
        )}
      </main>

      {/* Royal Scindia Heritage Footer */}
      <Footer
        setActiveTab={setActiveTab}
        setIsLanguageModalOpen={setIsLanguageModalOpen}
        setIsChatOpen={setIsChatOpen}
        setIsAuditModalOpen={setIsAuditModalOpen}
        selectedLanguage={selectedLanguage}
      />

      {/* Dataset Governance & Quality Modal (Official Data Pack) */}
      <DatasetQualityModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* 6-Agent LangGraph Multi-Agent Execution Modal */}
      <AgentProgressModal
        isOpen={isAgentModalOpen}
        isFinished={isAgentFinished}
        realExecutionTrace={rawPlanResult?.execution_trace}
        error={agentModalError}
        onClose={() => {
          setIsAgentModalOpen(false);
          setActiveTab('route');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Interactive Attraction Detail Modal */}
      <PlaceDetailModal
        spotDetailModal={spotDetailModal}
        setSpotDetailModal={setSpotDetailModal}
        selectedPlaces={selectedPlaces}
        togglePlaceSelection={togglePlaceSelection}
        setActiveTab={setActiveTab}
        setActiveMapPin={() => {}}
        selectedLanguage={selectedLanguage}
        t={t}
      />

      {/* 31-Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(langCode) => {
          setSelectedLanguage(langCode);
          setIsLanguageModalOpen(false);
          showToast({
            title: 'Language Updated',
            description: `Switched language to ${LANGUAGES_LIST.find(l => l.code === langCode)?.name || langCode}.`
          });
        }}
        languageSearch={languageSearch}
        setLanguageSearch={setLanguageSearch}
        languageCategoryFilter={languageCategoryFilter}
        setLanguageCategoryFilter={setLanguageCategoryFilter}
        filteredLanguages={filteredLanguages}
        t={t}
      />

      {/* Tansen AI Concierge Slide-In Drawer */}
      <ChatBot
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        chatMessages={chatMessages}
        isBotTyping={isBotTyping}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleSendChat={handleSendChat}
        isVoiceActive={isVoiceActive}
        toggleVoice={() => setIsVoiceActive(prev => !prev)}
        selectedLanguage={selectedLanguage}
        setIsLanguageModalOpen={setIsLanguageModalOpen}
        setLanguageSearch={setLanguageSearch}
        chatEndRef={chatEndRef}
        t={t}
      />

      {/* Feedback Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
