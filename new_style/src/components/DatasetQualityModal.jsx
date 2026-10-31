import { X, ShieldCheck, Database, CheckCircle2, AlertTriangle, ExternalLink, Award } from 'lucide-react';
import { DATA_PACK_MANIFEST, QUALITY_AUDIT_METRICS, REAL_LOCAL_BUSINESSES } from '../data/dataPackIntegration';

export default function DatasetQualityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-[#1C0407] text-[#FDFBF7] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#D4AF37] shadow-2xl relative p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#F3D279] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59B27]/20 border border-[#D4AF37]/50 text-xs font-bold uppercase tracking-wider text-[#F3D279]">
            <Database className="w-3.5 h-3.5 text-[#F3D279]" />
            <span>Tourism AI Data Pack • Audit Report</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Dataset Provenance & Quality Governance
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
            Every attraction and culinary stop in Beyond the Fort is backed by our curated candidate catalog, with strict separation between verified heritage sites and synthetic test records.
          </p>
        </div>

        {/* Key Metrics Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUALITY_AUDIT_METRICS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-stone-400 block uppercase tracking-wider">{item.metric}</span>
              <span className="font-display text-xl font-bold text-[#F3D279]">{item.count}</span>
              <span className={`text-[10px] block font-semibold ${
                item.status.includes('Filtered') ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* Guardrail Policy Statement */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Synthetic Hallucination Guarantee</span>
          </div>
          <p className="text-[11px] text-emerald-200/80 leading-relaxed">
            All 470 synthetic placeholder records from the initial raw seed dataset are quarantined and excluded from user-facing travel recommendations. Only verified ASI sites, municipal data, and real local businesses are suggested.
          </p>
        </div>

        {/* Real Local Businesses from Data Pack */}
        <div className="space-y-3">
          <h3 className="font-display text-base font-bold text-[#F3D279] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C59B27]" />
            <span>Audited Local Artisan & Culinary Partners ({REAL_LOCAL_BUSINESSES.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {REAL_LOCAL_BUSINESSES.map((b) => (
              <div key={b.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-white text-xs">{b.name}</span>
                  <span className="text-[10px] font-bold text-[#F3D279] bg-[#C59B27]/20 px-1.5 py-0.5 rounded">
                    ★ {b.rating} ({b.reviews})
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">{b.category} • {b.hours}</p>
                <p className="text-[11px] text-stone-300 line-clamp-1">{b.relevance}</p>
                <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold uppercase tracking-wider pt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{b.verificationStatus.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-stone-400">
          <span>Source: Gwalior Combined Candidate Catalog (CSV)</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#C59B27] hover:bg-[#d4a82b] text-[#2B070C] font-bold text-xs cursor-pointer transition-colors"
          >
            Close Audit View
          </button>
        </div>

      </div>
    </div>
  );
}
