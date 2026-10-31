import { useEffect, useState, useRef } from 'react';

/**
 * Beyond the Fort — Creative Visual Wipe Page Transition
 * Orchestrates seamless curtain wipes on tab navigation without page reloads
 */
export default function PageTransitionWipe({ activeTab }) {
  const [isWiping, setIsWiping] = useState(false);
  const previousTabRef = useRef(activeTab);

  useEffect(() => {
    if (previousTabRef.current !== activeTab) {
      previousTabRef.current = activeTab;
      setIsWiping(true);
      const timer = setTimeout(() => {
        setIsWiping(false);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  if (!isWiping) return null;

  return (
    <div className="fixed inset-0 z-9990 pointer-events-none flex flex-col justify-between overflow-hidden">
      {/* Top Curtain Panel */}
      <div className="w-full h-1/2 bg-[#2B070C] border-b-2 border-[#D4AF37] animate-wipe-down" />
      {/* Bottom Curtain Panel */}
      <div className="w-full h-1/2 bg-[#1C0407] border-t-2 border-[#D4AF37] animate-wipe-up" />
      
      {/* Centered Royal Monogram during wipe */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#1C0407] border-2 border-[#D4AF37] shadow-2xl flex items-center justify-center animate-pulse">
          <span className="font-display font-bold text-2xl text-[#F3D279]">♜</span>
        </div>
      </div>
    </div>
  );
}
