import { X, Globe, Search, Check } from 'lucide-react';
import { LANGUAGES_LIST } from '../translations';

export default function LanguageModal({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  languageSearch,
  setLanguageSearch,
  languageCategoryFilter,
  setLanguageCategoryFilter,
  filteredLanguages,
  t
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#D4AF37] shadow-2xl relative p-5 sm:p-7 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="w-11 h-11 rounded-full bg-[#8B0000]/10 border border-[#D4AF37] flex items-center justify-center mx-auto mb-2">
            <Globe className="w-6 h-6 text-[#8B0000]" />
          </div>
          <h3 className="font-heritage text-lg sm:text-xl font-bold text-[#8B0000]">
            {t('selectLangTitle')} (31 Languages)
          </h3>
          <p className="text-xs text-[#6B5E55]">
            {t('selectLangSubtitle')}
          </p>
        </div>

        {/* Search Input & Category Filter Tabs */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              placeholder="Search 31 languages (e.g. Hindi, Spanish, বাংলা, 日本語, தமிழ்)..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] bg-[#FDFBF7]"
            />
            {languageSearch && (
              <button
                onClick={() => setLanguageSearch('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
            {[
              { key: 'all', label: `All (${LANGUAGES_LIST.length})` },
              { key: 'Indian Languages', label: `Indian Languages (15)` },
              { key: 'International', label: `International (16)` }
            ].map(cat => (
              <button
                key={cat.key}
                onClick={() => setLanguageCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-semibold cursor-pointer ${
                  languageCategoryFilter === cat.key
                    ? 'bg-[#8B0000] text-white shadow-xs'
                    : 'bg-[#F5EFE6] text-[#6B5E55] hover:bg-[#D4AF37]/20 hover:text-[#8B0000]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 31 Languages Scrollable Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredLanguages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredLanguages.map(lang => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2.5 text-left ${
                      isSelected
                        ? 'border-[#8B0000] bg-[#8B0000]/10 shadow-xs ring-2 ring-[#D4AF37]'
                        : 'border-stone-200 hover:border-[#D4AF37] hover:bg-[#FDFBF7] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0 leading-none">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#2D241E] truncate">
                          {lang.native}
                        </div>
                        <div className="text-[10px] text-[#6B5E55] truncate">
                          {lang.name}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#8B0000] text-white flex items-center justify-center text-[10px] shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-stone-500">
              No languages matching "{languageSearch}"
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-[#6B5E55]">
          <span>
            Active: <strong className="text-[#8B0000]">{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.name} ({LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.native})</strong>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#8B0000] hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

