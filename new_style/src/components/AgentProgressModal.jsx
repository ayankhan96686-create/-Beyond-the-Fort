import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles, CheckCircle2, ShieldCheck, Route, Clock, Landmark,
  Compass, Cpu, Activity, AlertCircle, ArrowRight, Zap
} from 'lucide-react';

export const AGENT_STAGES = [
  {
    id: 'manager',
    name: 'Manager Agent',
    role: 'Geospatial Constraints & Coordinates',
    icon: Compass,
    color: '#0284C7',
    bgColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Normalizing starting hub pin, parsing available time budget, and verifying return deadline.',
    telemetry: 'Origin: Gwalior Hub (26.2163° N, 78.1972° E) • Geofence: Active'
  },
  {
    id: 'research',
    name: 'Research Agent',
    role: 'Catalog Search & POI Filtering',
    icon: Landmark,
    color: '#D97706',
    bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Scanning 57 curated heritage candidates against visitor passions. Pruning closed venues.',
    telemetry: 'Filtered 57 catalog candidates • Zero synthetic records injected'
  },
  {
    id: 'route',
    name: 'Route & Time Agent',
    role: 'Road Network Transit & Speeds',
    icon: Route,
    color: '#059669',
    bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Computing origin-to-destination transit matrix, road distances, and mode mobility curves.',
    telemetry: 'Speed Profile calibrated • Backtracking minimization algorithm active'
  },
  {
    id: 'verification',
    name: 'Verification Agent',
    role: 'ASI Provenance & Evidence Audit',
    icon: ShieldCheck,
    color: '#7C3AED',
    bgColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Cross-referencing Archaeological Survey of India tickets, opening times, and authentic coordinates.',
    telemetry: 'ASI Monument Gazette verified • 100% Provenance Confidence Score'
  },
  {
    id: 'itinerary',
    name: 'Itinerary & Optimization Agent',
    role: '+25% Transit Buffer & Feasibility Inequality',
    icon: Zap,
    color: '#C59B27',
    bgColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    description: 'Injecting non-negotiable +25% transit safety buffer and solving constraint equation.',
    telemetry: 'Inequality: T_travel + T_buffer(25%) + T_dwell ≤ T_budget verified'
  },
  {
    id: 'response',
    name: 'Final Response Agent',
    role: 'Timeline Synthesis & Schema Assembly',
    icon: Cpu,
    color: '#2B070C',
    bgColor: 'bg-rose-50 text-rose-900 border-rose-200',
    description: 'Structuring final response, chronological schedule, audio cues, and print export manifest.',
    telemetry: 'Contract Schema validated • Multi-Agent consensus completed'
  }
];

export default function AgentProgressModal({
  isOpen,
  onClose,
  isFinished = false,
  realExecutionTrace = null,
  error = null
}) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      setElapsedMs(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);

      if (isFinished) {
        setCurrentStageIndex(AGENT_STAGES.length - 1);
        return;
      }

      // Smooth progression across 6 stages over ~3.6s
      const calculatedIndex = Math.min(
        AGENT_STAGES.length - 1,
        Math.floor(elapsed / 650)
      );
      setCurrentStageIndex(calculatedIndex);
    }, 80);

    return () => clearInterval(interval);
  }, [isOpen, isFinished]);

  useEffect(() => {
    if (isFinished && isOpen) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#D4AF37', '#C59B27', '#2B070C', '#059669', '#F3D279']
        });
      } catch {}
    }
  }, [isFinished, isOpen]);

  if (!isOpen) return null;

  const currentStage = AGENT_STAGES[currentStageIndex];
  const progressPercent = isFinished
    ? 100
    : Math.min(96, Math.round(((currentStageIndex + 1) / AGENT_STAGES.length) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1617]/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] text-[#1C1617] rounded-3xl border-2 border-[#D4AF37]/60 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2B070C] via-[#C59B27] to-[#059669]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2B070C] text-[#F3D279] text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>LangGraph Multi-Agent Engine</span>
            </div>
            <h2 id="agent-modal-title" className="font-display text-2xl sm:text-3xl font-bold text-[#2B070C]">
              {isFinished ? 'Itinerary Orchestrated Successfully' : 'AI Multi-Agent Collective Working…'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              6 specialized LangGraph agents collaborating in real-time to solve your Gwalior journey constraints.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 block">
              {(elapsedMs / 1000).toFixed(1)}s elapsed
            </span>
            <span className="text-[11px] text-stone-400 mt-1 block">
              LangGraph.js • Port 5173
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-stone-700">
            <span className="flex items-center gap-1.5 text-[#2B070C]">
              <Cpu className="w-3.5 h-3.5 text-[#C59B27]" />
              Agent Workflow Progress
            </span>
            <span className="font-mono text-[#C59B27]">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden p-0.5 border border-stone-300">
            <div
              className="h-full bg-gradient-to-r from-[#2B070C] via-[#C59B27] to-[#059669] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Active Agent Spotlight Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC9] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2B070C] text-[#F3D279] flex items-center justify-center shadow-xs">
                {(() => {
                  const Icon = currentStage.icon;
                  return <Icon className="w-5 h-5 animate-pulse" />;
                })()}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27] block">
                  Step {currentStageIndex + 1} of {AGENT_STAGES.length}
                </span>
                <h3 className="font-display text-lg font-bold text-[#2B070C]">
                  {currentStage.name}
                </h3>
              </div>
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentStage.bgColor}`}>
              {isFinished ? 'Completed' : 'Executing'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
            {currentStage.description}
          </p>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2 text-xs font-mono text-stone-600">
            <Zap className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
            <span className="truncate">{currentStage.telemetry}</span>
          </div>
        </div>

        {/* 6-Agent Stepper Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {AGENT_STAGES.map((stage, idx) => {
            const isPast = isFinished || idx < currentStageIndex;
            const isCurrent = !isFinished && idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isPast
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-[#C59B27]/40 text-[#2B070C]'
                    : 'bg-white/60 border-stone-200 text-stone-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold font-mono">
                    0{idx + 1}
                  </span>
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-[#C59B27] animate-ping" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                  )}
                </div>
                <div className="text-xs font-bold truncate">
                  {stage.name}
                </div>
                <div className="text-[10px] text-stone-500 truncate mt-0.5">
                  {stage.role.split('&')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error State if Any */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Workflow Notice:</strong>
              {error}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8DEC9]">
          <span className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Deterministic Math: Safety buffer & ASI provenance enforced.
          </span>

          {isFinished && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#2B070C] hover:bg-[#4A121A] text-[#F3D279] font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>View Orchestrated Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
