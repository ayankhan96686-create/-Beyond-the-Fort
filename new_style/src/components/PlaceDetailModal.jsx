import {
  X, Clock, MapPin, Star, ShieldCheck, CheckCircle2,
  Volume2, Play
} from 'lucide-react';

export default function PlaceDetailModal({
  spotDetailModal,
  setSpotDetailModal,
  selectedPlaces,
  togglePlaceSelection,
  setActiveTab,
  setActiveMapPin,
  selectedLanguage,
  t
}) {
  if (!spotDetailModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37] shadow-2xl relative">
        <button
          onClick={() => setSpotDetailModal(null)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="h-56 relative">
          <img
            src={spotDetailModal.image}
            alt={spotDetailModal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] bg-[#D4AF37] text-[#5E0000] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {selectedLanguage === 'hi' ? spotDetailModal.tierLabelHi : spotDetailModal.tierLabel}
            </span>
            <h3 className="font-heritage text-xl font-bold mt-1">
              {selectedLanguage === 'hi' ? spotDetailModal.hindiName : spotDetailModal.name}
            </h3>
            <p className="text-xs text-[#F5D77F]">
              {selectedLanguage === 'hi' ? spotDetailModal.name : spotDetailModal.hindiName}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-[#8B0000]" />
              {spotDetailModal.duration}m {t('visit')}
            </span>
            <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-[#8B0000]" />
              {spotDetailModal.distanceKm} km {t('away')}
            </span>
            <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {spotDetailModal.rating} ({spotDetailModal.reviews})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{t('verified')}: {spotDetailModal.verifiedBy}</div>
              <div className="text-[11px] text-emerald-700">Official Heritage Authenticity Guarantee.</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs text-[#8B0000] uppercase tracking-wider mb-1">
              {t('modalSignificance')}
            </h4>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              {selectedLanguage === 'hi' ? spotDetailModal.descriptionHi : spotDetailModal.description}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs text-[#8B0000] uppercase tracking-wider mb-2">
              {t('modalHighlights')}
            </h4>
            <div className="space-y-1.5">
              {(selectedLanguage === 'hi' ? spotDetailModal.highlightsHi : spotDetailModal.highlights).map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#AA820A] shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-[#FDFBF7] p-3 rounded-xl border border-stone-200">
            <div>
              <span className="text-[#6B5E55] block">{t('modalHours')}</span>
              <span className="font-semibold text-stone-800">{spotDetailModal.hours}</span>
            </div>
            <div>
              <span className="text-[#6B5E55] block">{t('modalPrice')}</span>
              <span className="font-semibold text-[#8B0000]">
                {selectedLanguage === 'hi' ? spotDetailModal.priceHi : spotDetailModal.price}
              </span>
            </div>
          </div>

          {/* Audio Guide */}
          <div className="p-3 rounded-xl bg-[#F5EFE6] border border-[#D4AF37]/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#8B0000]" />
              <span className="font-medium text-[#2D241E]">
                {t('modalAudioGuide')} ({selectedLanguage.toUpperCase()})
              </span>
            </div>
            <button
              onClick={() => alert(`Playing audio heritage guide for ${selectedLanguage === 'hi' ? spotDetailModal.hindiName : spotDetailModal.name}...`)}
              className="px-3 py-1 rounded-lg bg-[#8B0000] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" /> {t('listenAudio')}
            </button>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                togglePlaceSelection(spotDetailModal.id);
                setSpotDetailModal(null);
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPlaces.includes(spotDetailModal.id)
                  ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  : 'bg-[#8B0000] text-white hover:bg-[#700000]'
              }`}
            >
              {selectedPlaces.includes(spotDetailModal.id)
                ? t('removeFromItinerary')
                : t('addToRoute')}
            </button>
            <button
              onClick={() => {
                const spotId = spotDetailModal.id;
                setSpotDetailModal(null);
                setActiveTab('route');
                setActiveMapPin(spotId);
              }}
              className="px-4 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-[#5E0000] font-bold text-xs cursor-pointer"
            >
              {t('locateOnMap')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

