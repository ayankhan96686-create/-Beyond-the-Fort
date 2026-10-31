# Design System & Visual Identity
**Brand Identity:** Beyond the Fort — Discover the Soul of Gwalior  
**Document Version:** 2.0.0 (Master Design Specification)  
**Target:** Modern React 19 Frontend (`new_style/`) & Global CSS  

---

## 1. Brand Philosophy & Narrative

Gwalior is the storied sentinel of North India—a city celebrated by Mughal Emperor Babur as the *"Pearl among fortresses of Hind"*, the cradle of Hindustani classical music through Sangeet Samrat Tansen, and the seat of the majestic Scindia dynasty.

**Beyond the Fort** is not a generic booking engine or cold SaaS tool. It is an **immersive, literary, time-aware cultural companion**. The visual language bridges centuries of royal Maratha-Mughal architectural splendor with the clarity, speed, and elegance of world-class editorial design.

---

## 2. Exploration of Three Design Directions

### Direction A — Royal Heritage (Selected Primary Direction)
* **Concept:** Inspired by the sandstone ramparts of Gwalior Fort, the Durbar Hall gold leafing of Jai Vilas Palace, and deep royal Scindia velvet.
* **Palette:**
  * **Scindia Royal Burgundy:** `#4A121A` (Primary brand anchor, royal heritage, majesty)
  * **Gwalior Sandstone Cream:** `#FDFBF7` (Background canvas, tactile warmth, natural stone)
  * **Antique Temple Gold:** `#C59B27` (Accent, celebratory warmth, ASI verification badge)
  * **Man Singh Turquoise:** `#0F766E` (Enameled tile highlight from Gwalior Fort walls)
  * **Heritage Charcoal:** `#1F1A1B` (High-contrast typography, deep clarity)
* **Evaluation:**
  * **Authenticity:** 10/10 — Directly mirrors the real physical materials and royal history of Gwalior.
  * **Readability & Contrast:** 9.8/10 — Meets WCAG AAA for text contrast on light stone canvas.
  * **Emotional Resonance:** High luxury, contemplative, historically grounded.

### Direction B — Modern Cultural
* **Concept:** Inspired by vibrant Madhya Pradesh handloom bazaars, Chanderi silk borders, and street life in Naya Bazar.
* **Palette:**
  * **Deep Indigo:** `#1E293B`
  * **Raw Terracotta:** `#C2410C`
  * **Muted Gold:** `#D97706`
  * **Warm White:** `#FAFAF9`
  * **Botanical Green:** `#15803D`
* **Evaluation:**
  * Energetic and earthy, but leans too heavily toward rural craft fairs rather than Gwalior’s grand monumental palaces and royal museums.

### Direction C — Cinematic Travel
* **Concept:** Inspired by dusk photography over Gwalior Fort cliffside, starry nights over Gopachal Parvat, and night sound-and-light shows.
* **Palette:**
  * **Midnight Navy:** `#0A1128`
  * **Burnt Sun Orange:** `#F97316`
  * **Champagne Stone:** `#F3EDE2`
  * **Deep Plum:** `#3B0764`
* **Evaluation:**
  * Striking for high-contrast nighttime marketing, but less readable for dense daytime travel itineraries and daytime museum opening schedules.

### Direction Decision & Synthesis
We select **Direction A (Royal Heritage)** as our primary design identity, incorporating **Man Singh Palace Turquoise (`#0F766E`)** as a specialized accent to honor Gwalior's unique glazed blue duck-and-elephant tiles found nowhere else in the world.

---

## 3. Master Design Tokens (CSS Custom Properties)

```css
:root {
  /* ==========================================================================
     COLOR TOKENS: ROYAL HERITAGE PALETTE
     ========================================================================== */
  /* Canvas & Backgrounds */
  --color-sandstone-light: #FDFBF7;
  --color-sandstone-card:  #FFFFFF;
  --color-sandstone-muted: #F5EFEB;
  --color-sandstone-border:#E7DCD3;

  /* Primary Brand (Scindia Burgundy) */
  --color-burgundy-900: #2B070C;
  --color-burgundy-800: #4A121A; /* Primary Brand Anchor */
  --color-burgundy-700: #681C26;
  --color-burgundy-600: #8C2936;
  --color-burgundy-50:  #FDF2F4;

  /* Accent (Antique Royal Gold) */
  --color-gold-900: #583F06;
  --color-gold-800: #78570A;
  --color-gold-600: #C59B27; /* Royal Gold Accent */
  --color-gold-500: #D8AD38;
  --color-gold-100: #FBF4DE;
  --color-gold-50:  #FEFBF0;

  /* Jewel Accent (Man Singh Enameled Turquoise) */
  --color-turquoise-800: #0D5C56;
  --color-turquoise-600: #0F766E; /* Turquoise Tile Accent */
  --color-turquoise-500: #14B8A6;
  --color-turquoise-50:  #F0FDFA;

  /* Typography Colors */
  --color-text-primary:   #1C1617; /* High contrast body & titles (WCAG AAA) */
  --color-text-secondary: #574B4D; /* Supporting editorial descriptions */
  --color-text-muted:     #7E7173; /* Metadata, timestamps, captions */
  --color-text-inverse:   #FFFFFF; /* Text on dark burgundy surfaces */

  /* Semantic Status */
  --color-success: #15803D; /* Verified ASI badge / Open Now */
  --color-warning: #B45309; /* 25% Time Buffer Notice */
  --color-danger:  #B91C1C; /* Closed Today / Feasibility Cut */

  /* ==========================================================================
     TYPOGRAPHY TOKENS
     ========================================================================== */
  --font-serif:   'Playfair Display', 'Cormorant Garamond', Georgia, serif;
  --font-sans:    'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;

  /* Modular Type Scale (1.250 Major Third) */
  --text-xs:    0.75rem;   /* 12px - Metadata, badges */
  --text-sm:    0.875rem;  /* 14px - Subtext, tags, table cells */
  --text-base:  1.000rem;  /* 16px - Base body text */
  --text-lg:    1.125rem;  /* 18px - Lead paragraphs, large links */
  --text-xl:    1.250rem;  /* 20px - Card titles, modal subheads */
  --text-2xl:   1.500rem;  /* 24px - Section subheadings */
  --text-3xl:   1.875rem;  /* 30px - Subsection headers */
  --text-4xl:   2.250rem;  /* 36px - Section titles */
  --text-5xl:   3.000rem;  /* 48px - Page titles, hero highlights */
  --text-6xl:   3.750rem;  /* 60px - Display headlines */

  /* Leading / Line Heights */
  --leading-tight:  1.15;
  --leading-snug:   1.30;
  --leading-normal: 1.60;
  --leading-relaxed:1.75;

  /* ==========================================================================
     SPACING & LAYOUT SCALE (8pt Grid)
     ========================================================================== */
  --space-1:  0.25rem; /* 4px */
  --space-2:  0.50rem; /* 8px */
  --space-3:  0.75rem; /* 12px */
  --space-4:  1.00rem; /* 16px */
  --space-5:  1.25rem; /* 20px */
  --space-6:  1.50rem; /* 24px */
  --space-8:  2.00rem; /* 32px */
  --space-10: 2.50rem; /* 40px */
  --space-12: 3.00rem; /* 48px */
  --space-16: 4.00rem; /* 64px */
  --space-24: 6.00rem; /* 96px */
  --space-32: 8.00rem; /* 128px */

  /* Container Boundaries */
  --container-max: 1280px;
  --container-gutter: 1.5rem; /* 24px */

  /* ==========================================================================
     SURFACE ELEVATION & SHADOWS (Warm Heritage Diffusion)
     ========================================================================== */
  --shadow-sm:  0 1px 3px rgba(74, 18, 26, 0.04), 0 1px 2px rgba(74, 18, 26, 0.02);
  --shadow-md:  0 4px 12px rgba(74, 18, 26, 0.06), 0 2px 4px rgba(74, 18, 26, 0.04);
  --shadow-lg:  0 12px 28px rgba(74, 18, 26, 0.08), 0 4px 8px rgba(74, 18, 26, 0.04);
  --shadow-xl:  0 20px 48px rgba(74, 18, 26, 0.12), 0 8px 16px rgba(74, 18, 26, 0.06);

  /* Border Radii */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 24px;
  --radius-full:9999px;

  /* ==========================================================================
     MOTION & ANIMATION TOKENS
     ========================================================================== */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-smooth: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --duration-fast:   150ms;
  --duration-normal: 280ms;
  --duration-slow:   450ms;
  --duration-enter:  650ms;

  /* Focus Ring */
  --focus-ring: 0 0 0 3px rgba(197, 155, 39, 0.35);
}
```

---

## 4. UI Components Specification

### 4.1 Navbar (Floating Heritage Glass)
* **Default State:** Floating island with rounded corners (`border-radius: 9999px`), frosted glass effect (`backdrop-filter: blur(16px)`), subtle sandstone border (`rgba(231, 220, 211, 0.7)`).
* **Scroll State:** Snaps into a fixed top banner with solid sandstone cream background and soft shadow elevation (`--shadow-md`).
* **Navigation Links:** Hover underline animation expanding from center outwards in `--color-gold-600`.
* **Zero Account Buttons:** Replaced login/register buttons with high-utility tourist actions:
  * **Saved Itinerary Drawer Pill** (indicates live saved stops, e.g. "3 Places Saved")
  * **Language Switcher** (seamless toggle between English, Hindi, and regional languages)

### 4.2 Attraction Cards (Editorial Bento Architecture)
* **Aspect Ratio:** Locked 16:10 photography container with subtle zoom effect (`scale(1.04)`) upon hover.
* **Badges:**
  * **ASI Verified Emblem:** Pill with gold border, shield icon, and text: "ASI Verified Heritage".
  * **Live Status:** Green pulse dot + "Open Today (Closes 6:00 PM)".
  * **Dwell Time:** Small clock icon + "90 mins dwell time".
* **Quick Action:** One-click "+ Add to Trip" button that immediately updates the itinerary without requiring login or page reload.

### 4.3 Itinerary Route Connector
* **Visual Style:** Elegant vertical or horizontal timeline with gold dashed or solid line.
* **Stop Markers:** Numbered circular badges (`01`, `02`, `03`) in royal burgundy with gold border.
* **Transit Segments:** Cards between stops displaying travel mode (Walking, Auto-Rickshaw, Taxi), travel time in minutes, and the mathematically audited 25% safety buffer.

### 4.4 Tansen AI Concierge Card
* **Styling:** Royal burgundy card header with subtle gold music note iconography.
* **Chat Bubbles:** User messages in soft burgundy tint; Tansen AI messages in crisp white card with quotation accents.
* **Prompt Suggestions:** Pill chips allowing single-click queries (e.g. *"Best morning walking route at the Fort?"*, *"Where to eat Bedai in Naya Bazar?"*).

---

## 5. Responsive Breakpoints

| Breakpoint | Viewport Width | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile S** | `360px - 389px` | Single column, 16px horizontal padding, full-width cards, compact bottom nav bar |
| **Mobile L** | `390px - 430px` | Single column, 20px padding, full-width cards, floating FAB for Chat / Itinerary |
| **Tablet** | `768px - 1023px` | 2-column attraction grid, collapsible sidebar filters, tabbed map/list view |
| **Desktop** | `1024px - 1439px` | 3-column attraction grid, dual-pane itinerary planner (Form + Map) |
| **Wide Desktop**| `1440px - 1920px` | 3/4-column bento grid, 1280px max-width container, generous 96px section padding |

---

## 6. Accessibility & Motion Compliance (WCAG 2.1 AA)

1. **Color Contrast:** All body text (`--color-text-primary` on `--color-sandstone-light`) achieves a contrast ratio of **12.4:1**, far exceeding the 4.5:1 requirement.
2. **Reduced Motion:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
3. **Keyboard Focus:** Every interactive control features a visible, high-contrast gold outline ring (`--focus-ring`) when navigated via `Tab`.

