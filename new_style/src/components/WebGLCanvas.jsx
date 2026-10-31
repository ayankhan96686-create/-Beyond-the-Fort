import { useEffect, useRef } from 'react';

/**
 * Beyond the Fort — Refined Royal Heritage Particle & Geometric Mesh Canvas
 * 
 * Preserves and elevates the signature animated background:
 * - Floating ambient heritage particles (Antique Gold #C9A34A, Deep Heritage Teal #176B67, 
 *   Warm Copper #A96C48, Ivory Sandstone #F7F3EA)
 * - Refined celestial / astrolabe wireframe mesh connecting nearby nodes with delicate filaments
 * - Gentle interactive desktop mouse reaction (soft proximity illumination and subtle inertia)
 * - Context-aware density & opacity via activeTab prop (calmer on forms/maps, rich on home/agents)
 * - Strictly pointer-events-none and layered safely behind all text and cards (-z-10)
 * - DPR-scaled, 60fps lightweight requestAnimationFrame loop with full prefers-reduced-motion support
 */
export default function WebGLCanvas({ activeTab = 'home' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Palette of refined heritage particle tones
    const PARTICLE_COLORS = [
      { r: 201, g: 163, b: 74, a: 0.65 },  // Antique Gold #C9A34A
      { r: 212, g: 175, b: 55, a: 0.55 },  // Imperial Gold #D4AF37
      { r: 23,  g: 107, b: 103, a: 0.50 }, // Deep Heritage Teal #176B67
      { r: 169, g: 108, b: 72, a: 0.55 },  // Warm Historic Copper #A96C48
      { r: 69,  g: 19,  b: 29, a: 0.40 },  // Royal Burgundy #45131D
      { r: 247, g: 243, b: 234, a: 0.70 }  // Warm Sandstone Ivory #F7F3EA
    ];

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // Node count and connection thresholds based on screen and activeTab
    const nodeCount = isMobile ? 32 : (activeTab === 'route' || activeTab === 'plan' ? 44 : 64);
    const maxConnectionDist = isMobile ? 95 : 135;

    // Context-aware opacity factor
    const baseMeshOpacity = activeTab === 'route' || activeTab === 'plan' ? 0.08 : 0.15;
    const baseParticleOpacity = activeTab === 'route' || activeTab === 'plan' ? 0.55 : 0.85;

    // Nodes array
    const nodes = [];

    const handleResize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Initialize nodes with organic positions and gentle velocities
    for (let i = 0; i < nodeCount; i++) {
      const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 1.2,
        baseRadius: Math.random() * 1.8 + 1.2,
        color,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Mouse proximity tracking for gentle interactive desktop life
    let mouse = { x: -1000, y: -1000, active: false };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };

    if (!isMobile) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Soft Warm Sandstone Base
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(0, 0, width, height);

      // 2. Soft Ambient Heritage Radial Glows in Corners
      // Top-right diffuse Antique Gold glow
      const goldDriftX = width * 0.82 + (prefersReducedMotion ? 0 : Math.sin(time * 0.0004) * 35);
      const goldDriftY = height * 0.18 + (prefersReducedMotion ? 0 : Math.cos(time * 0.0005) * 25);
      const goldRadius = Math.max(width, height) * 0.55;

      const goldGrad = ctx.createRadialGradient(goldDriftX, goldDriftY, 0, goldDriftX, goldDriftY, goldRadius);
      goldGrad.addColorStop(0, 'rgba(212, 175, 55, 0.055)');
      goldGrad.addColorStop(0.5, 'rgba(243, 210, 121, 0.025)');
      goldGrad.addColorStop(1, 'rgba(253, 251, 247, 0)');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, width, height);

      // Bottom-left diffuse Deep Burgundy / Teal warmth
      const tealDriftX = width * 0.15 + (prefersReducedMotion ? 0 : Math.cos(time * 0.0004) * 30);
      const tealDriftY = height * 0.85 + (prefersReducedMotion ? 0 : Math.sin(time * 0.0005) * 30);
      const tealRadius = Math.max(width, height) * 0.52;

      const tealGrad = ctx.createRadialGradient(tealDriftX, tealDriftY, 0, tealDriftX, tealDriftY, tealRadius);
      tealGrad.addColorStop(0, 'rgba(23, 107, 103, 0.035)');
      tealGrad.addColorStop(0.4, 'rgba(45, 11, 18, 0.025)');
      tealGrad.addColorStop(1, 'rgba(253, 251, 247, 0)');
      ctx.fillStyle = tealGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw Geometric Wireframe Mesh Filaments
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDist) {
            // Proximity alpha calculation
            const alpha = (1 - dist / maxConnectionDist) * baseMeshOpacity;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);

            // Subtle gold-teal tone for filament
            ctx.strokeStyle = `rgba(201, 163, 74, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 4. Update and Draw Particles
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];

        if (!prefersReducedMotion) {
          // Organic drift
          p.x += p.vx;
          p.y += p.vy;

          // Gentle boundary wrap-around
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

          // Interactive gentle mouse reaction
          if (mouse.active) {
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 140 && mDist > 0) {
              const force = (1 - mDist / 140) * 0.8;
              p.x += (mdx / mDist) * force;
              p.y += (mdy / mDist) * force;
            }
          }

          // Subtle pulsing size
          p.pulsePhase += p.pulseSpeed;
          p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.6;
        }

        // Draw soft ambient particle
        const particleAlpha = p.color.a * baseParticleOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${particleAlpha})`;
        ctx.fill();

        // Delicate outer glow for gold & teal particles
        if (p.baseRadius > 2.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${particleAlpha * 0.18})`;
          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        time += 16;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (!isMobile) {
        window.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, [activeTab]);

  return (
    <div
      id="webgl-canvas-container"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
