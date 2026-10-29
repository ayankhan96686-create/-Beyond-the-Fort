import { CheckCircle2, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-60 max-w-sm w-full bg-white rounded-2xl border-2 border-[#D4AF37] shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
      <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-heritage text-sm font-bold text-[#8B0000] truncate">
          {toast.title}
        </h4>
        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
          {toast.description}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

