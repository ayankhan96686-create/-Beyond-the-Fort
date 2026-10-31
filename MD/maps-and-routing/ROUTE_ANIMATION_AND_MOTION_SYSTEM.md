# ROUTE ANIMATION AND MOTION SYSTEM — BEYOND THE FORT
**Inspirations:** Active Theory WebGL & Locomotive High-End Motion  
**Date:** October 31, 2026

---

## 1. Motion Philosophy

The motion design of Beyond the Fort is grounded in historical gravitas and digital fluidity. Rather than relying on generic CSS transitions or disruptive scroll-hijacking, motion serves as an orienting, tactile layer that guides the user through Gwalior's royal chapters.

---

## 2. Motion System Layers

### 1. WebGL 3D Background Canvas (`WebGLCanvas.jsx`)
- **Technology:** Three.js (`three` `^0.187.0`).
- **Constellation:** 1,200 particle stars in sandstone, gold, and turquoise hues floating in 3D space with subtle rotational drift.
- **Sandstone Terrain Mesh:** Procedural PlaneGeometry ($60 \times 60$ segments) deformed by sine/cosine wave equations to simulate the undulating Fort plateau.
- **Dynamic Lighting:** Interactive point light tracking pointer coordinates, casting warm golden illumination onto the terrain mesh.
- **Accessibility:** Motion is automatically paused when `prefers-reduced-motion: reduce` is active.

### 2. Locomotive Inertia Momentum Scroll (`useLenisScroll.js`)
- **Technology:** Lenis (`lenis` `^1.3.27`).
- **Behavior:** Smooth damping factor ($1.2$) providing weight and elegance to vertical scrolling.
- **Anchor Linking:** Seamlessly synchronizes with internal anchor links (`#hero`, `#discover`, `#planner`).

### 3. Custom Magnetic Cursor (`CustomCursor.jsx`)
- **Visual Design:** Inner golden dot ($6\text{px}$) with an outer trailing inertia ring ($36\text{px}$).
- **State Morphing:**
  - Standard: Minimalist ring.
  - On Card Hover: Expands to $56\text{px}$ with `"EXPLORE"` label.
  - On Button Hover: Magnetic attraction and golden pulse with `"SELECT"` label.
  - On Map / Link Hover: Scales to $48\text{px}$ with `"OPEN"` label.
- **Device Support:** Automatically disabled on touch/tablet devices (`hover: none`, `pointer: coarse`).

### 4. Page Transition Royal Wipe (`PageTransitionWipe.jsx`)
- **Animation:** GSAP (`gsap` `^3.15.0`) powered dual-blade curtain wipe in Royal Burgundy (`#2B070C`) with a trailing Gold accent bar.
- **Duration:** $0.4\text{s}$ wipe-in, $0.35\text{s}$ wipe-out on active tab changes.

### 5. Multi-Agent Stepper Radar (`AgentProgressModal.jsx`)
- Continuous pulsing radial glow behind the active executing agent node.
- Real-time progress bar with CSS gradient ease-out transition.
- Celebratory confetti burst (`canvas-confetti`) upon workflow completion.

---

## 3. Performance & Frame Rate Verification
- Target Frame Rate: **60 FPS on standard desktop displays; 120 FPS on ProMotion / high-refresh displays**.
- GPU Memory Footprint: $< 32\text{ MB}$ VRAM for WebGL canvas.
- CPU Utilization: $< 4\%$ overhead during continuous scrolling.

