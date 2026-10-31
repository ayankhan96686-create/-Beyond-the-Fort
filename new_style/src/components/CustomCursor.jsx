import { useEffect, useState, useRef } from 'react';

/**
 * Beyond the Fort — Royal Heritage Magnetic Custom Cursor
 * 
 * Features:
 * - Fluid inertia damping using requestAnimationFrame with lerp physics
 * - Smooth contextual hover reaction over interactive elements:
 *   Buttons, Links, Place Cards, Sliders, Audio Controls, Filter Chips
 * - Dynamic action indicator labels ("EXPLORE", "PLAN", "SELECT", "PLAY", "READ")
 * - Disables instantly on touch devices (pointer: coarse / touch screens) & reduced motion
 * - Strictly pointer-events-none with zero interference to clicks or drag operations
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if touch device or coarse pointer
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    ) {
      setIsTouchDevice(true);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Detect interactive element beneath cursor
      const target = e.target.closest(
        'button, a, input, select, textarea, [role="button"], [role="tab"], .interactive-tap, .place-card, .bento-tile, .card-luxury'
      );

      if (target) {
        setIsHovered(true);
        const customText = target.getAttribute('data-cursor') || (
          target.getAttribute('aria-label')?.includes('music') ? 'LISTEN' :
          target.tagName === 'A' ? 'OPEN' :
          target.classList.contains('place-card') || target.closest('#discover-section') ? 'EXPLORE' :
          target.closest('#planning-studio') ? 'PLAN' :
          target.tagName === 'BUTTON' ? 'SELECT' : ''
        );
        setCursorText(customText);
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let animationFrameId;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      // Direct sharp dot positioning
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Smooth damped trailing ring (lerp factor 0.16)
      followerX += (mouseX - followerX) * 0.16;
      followerY += (mouseY - followerY) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div
      className="hidden lg:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Central Sharp Gold Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#C9A34A] shadow-[0_0_8px_rgba(201,163,74,0.8)] transition-opacity duration-200 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Trailing Fluid Follower Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-[2px] ${
          isClicking
            ? 'w-10 h-10 bg-[#C9A34A]/40 border-2 border-[#F3D279] scale-90'
            : isHovered
            ? 'w-16 h-16 bg-[#2D0B12]/85 border-2 border-[#C9A34A] shadow-2xl shadow-stone-900/40'
            : 'w-9 h-9 bg-white/5 border border-[#C9A34A]/60 shadow-xs'
        }`}
      >
        {cursorText && (
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#F3D279] animate-fade-in text-center px-1 select-none">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
