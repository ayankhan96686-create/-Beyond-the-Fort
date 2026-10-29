import {
  Sparkles, Music, Volume2, VolumeX, X, ChevronRight, Send
} from 'lucide-react';
import { LANGUAGES_LIST } from '../translations';
import { getLocalizedWelcomeMessage } from '../aiConcierge';

export default function ChatBot({
  isChatOpen,
  setIsChatOpen,
  chatMessages,
  isBotTyping,
  chatInput,
  setChatInput,
  handleSendChat,
  isVoiceActive,
  toggleVoice,
  selectedLanguage,
  setIsLanguageModalOpen,
  setLanguageSearch,
  chatEndRef,
  t
}) {
  return (
    <>
      {/* Floating Action Button for AI Concierge */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsChatOpen(prev => !prev)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-linear-to-r from-[#8B0000] via-[#750000] to-[#AA820A] text-white font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-[#D4AF37] cursor-pointer"
          title="Open Tansen AI"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#F5D77F]" />
            <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#F5D77F] opacity-75"></span>
          </div>
          <span className="font-heritage tracking-wide">{t('tansenAI')}</span>
        </button>
      </div>

      {/* Slide-in Chat Drawer */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] max-w-full bg-white shadow-2xl border-l border-[#D4AF37]/50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 bg-linear-to-r from-[#8B0000] to-[#600000] text-white flex items-center justify-between border-b border-[#D4AF37]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
                <Music className="w-5 h-5 text-[#F5D77F]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heritage text-sm font-bold text-white">
                    {t('botHeaderTitle')}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-[#F5E6BE]">
                  {t('botHeaderSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleVoice}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isVoiceActive ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-stone-200 hover:bg-white/20'
                }`}
                title="Voice Assistant Mode"
              >
                {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active AI Language Indicator Banner */}
          <button
            type="button"
            onClick={() => {
              setLanguageSearch('');
              setIsLanguageModalOpen(true);
            }}
            className="w-full bg-[#48080a] hover:bg-[#5a0b0d] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#F5D77F] border-b border-[#D4AF37]/30 transition-colors cursor-pointer text-left"
            title="Click to change AI language"
          >
            <div className="flex items-center gap-1.5">
              <span>{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.flag || '🌐'}</span>
              <span className="font-bold">
                {LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.native || 'English'} ({LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.name || 'English'})
              </span>
            </div>
            <span className="text-[10px] text-stone-300 font-medium flex items-center gap-1">
              <span>
                {selectedLanguage === 'hi'
                  ? 'भाषा बदलें'
                  : selectedLanguage === 'bundeli'
                  ? 'भाषा बदलो'
                  : 'Change Language'}
              </span>
              <ChevronRight className="w-3 h-3 text-[#F5D77F]" />
            </span>
          </button>

          {/* Quick Prompt Chips */}
          <div className="p-3 bg-[#FDFBF7] border-b border-stone-200 overflow-x-auto whitespace-nowrap space-x-1.5 text-xs">
            {[
              t('botChip1'),
              t('botChip2'),
              t('botChip3'),
              t('botChip4'),
              t('botChip5')
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(chip)}
                className="inline-block px-3 py-1 rounded-full bg-white hover:bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#8B0000] text-[11px] font-medium transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF7F0]/60">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#8B0000] text-white rounded-tr-none'
                      : 'bg-white text-[#2D241E] border border-[#D4AF37]/40 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p>{msg.id === 1 && msg.sender === 'bot' ? getLocalizedWelcomeMessage(selectedLanguage) : msg.text}</p>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendChat(sug)}
                          className="text-[10px] bg-[#F5EFE6] hover:bg-[#D4AF37]/30 text-[#8B0000] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                        >
                          → {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex items-center gap-2 text-xs text-[#8B0000] italic bg-white p-2.5 rounded-xl border border-stone-200 w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#AA820A]" />
                <span>{selectedLanguage === 'hi' ? 'तानसेन एआई सलाह तैयार कर रहे हैं...' : 'Tansen AI is composing royal advice...'}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t('botPlaceholder')}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] bg-[#FDFBF7]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-stone-400 text-center mt-1.5">
              {t('botDisclaimer')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

