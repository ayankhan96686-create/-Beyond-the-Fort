import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Beyond the Fort — Smooth Momentum Scrolling Hook (Lenis)
 * Implements smooth inertia scrolling matching Locomotive/Awwwards benchmarks
 */
export function useLenisScroll() {
  useEffect(() => {
    // Respect reduced motion
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.4,
        infinite: false
      });

      let rafId;
      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      // Expose to window for custom anchor scrolling if needed
      window.__lenis = lenis;

      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        delete window.__lenis;
      };
    } catch (err) {
      console.warn('[Lenis] Smooth scroll fallback:', err);
    }
  }, []);
}

export default useLenisScroll;
