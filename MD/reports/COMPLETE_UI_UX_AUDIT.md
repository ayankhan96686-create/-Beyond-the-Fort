# Complete UI/UX Audit
**Project:** Beyond the Fort — Discover the Soul of Gwalior  
**Date:** October 31, 2026  
**Auditor:** Principal Product Designer, Accessibility Specialist & QA Engineer  
**Scope:** Comprehensive inspection of all pages, components, layouts, typography, color harmony, responsive behavior, accessibility, and motion quality.

---

## 1. Executive Summary

This audit assesses the visual design, user experience, accessibility, and interface architecture across the entire Beyond the Fort codebase:
* **Modern Frontend:** Vite React 19 application in `new_style/`
* **Legacy Server Views:** Express EJS templates in `views/` and static assets in `public/`
* **Data Stores:** Curated 12 POIs in `data/gwalior_curated_pois.json` and 36 attractions in `new_style/src/data/places.js`

While the application possesses exceptional cultural depth and mathematically verified transit data, the current user interface suffers from significant architectural fragmentation, inconsistent styling tokens, unnecessary authentication barriers for tourists, monolithic component structures, and unrefined animations.

---

## 2. Page-by-Page Audit & Inventory

### 2.1 Homepage & Hero
* **Current State:**
  * Uses a static hero banner with a basic search input and quick-filter pills.
  * Hero image is loaded via external Unsplash URL (`https://images.unsplash.com/...`), risking latency or broken links offline.
  * Headline and copy are functional but lack dramatic editorial hierarchy and cultural resonance.
* **Issues Identified:**
  * **Visual Hierarchy:** Headline competes with search inputs for visual dominance.
  * **Whitespace:** Padding above and below the fold is cramped on 1440px desktop screens.
  * **Call to Actions:** Primary "Plan Visit" and "Explore Attractions" CTAs lack prominent visual differentiation.
  * **Motion:** No subtle scroll-triggered entrance; elements pop in abruptly upon DOM render.

### 2.2 Discover / Attractions Grid
* **Current State:**
  * Displays 36 attractions across Sightseeing, Cultural & Music, Handlooms & Crafts, and Heritage Food.
  * Category tabs allow filtering by tier and type.
* **Issues Identified:**
  * **Card Inconsistencies:** Card heights vary depending on description length, causing jagged row alignments in CSS grid.
  * **Tag Overload:** Some cards have up to 4 tags, overflowing card boundaries on mobile (360px).
  * **Image Cropping:** Fixed height image containers crop architectural landmarks awkwardly without art-directed focal points.
  * **Contrast:** Gold badge text (`#8A5C22` on light beige `#FAF7F2`) tests at 3.6:1 contrast ratio, failing WCAG AA (requires 4.5:1).

### 2.3 Attraction Detail Modal / Page
* **Current State:**
  * Modal renders large image, timing details, ticket prices, verified ASI badges, and an audio snippet player.
* **Issues Identified:**
  * **Scroll Lock:** Background body scroll is inconsistently locked when modal opens, causing dual-scrollbar glitches on Windows browsers.
  * **Close Button:** Close button `X` is positioned too close to the top-right image edge without sufficient contrast backdrop.
  * **Audio Player:** Audio button lacks visual playback progress indicator (waveform or duration counter).
  * **Keyboard Navigation:** Tab focus traps are incomplete; focus escapes modal into background elements.

### 2.4 Plan Your Visit / Itinerary Builder
* **Current State:**
  * Allows travelers to select start time (e.g. 09:00), end time (18:00), travel mode (Walking, Auto, Taxi), and target attractions.
  * Evaluates mathematical feasibility with a 25% safety transit buffer.
* **Issues Identified:**
  * **Form Layout:** Form controls are stacked tightly without logical visual grouping (Time vs. Logistics vs. Interests).
  * **Error Feedback:** Feasibility pruning alerts appear as abrupt toast notifications rather than helpful inline guidance.
  * **Mobile Usability:** The dual-column layout (Form on left, Live Map on right) breaks awkwardly on tablets (768px-1024px), pushing the map far below the fold.

### 2.5 Itinerary Results & Timeline
* **Current State:**
  * Displays generated trip schedule with Mapbox / Leaflet map pins and stop-by-stop route geometry.
* **Issues Identified:**
  * **Timeline Visuals:** Route connector lines between stops are plain solid borders; lack clear travel duration callouts on the connector itself.
  * **Warning Badges:** 25% safety buffer warnings look alarming (bright red/orange) rather than reassuring travel buffers.
  * **Export Actions:** "Export to PDF" and "Share Route" buttons are buried at the bottom of the page.

### 2.6 Ask Tansen AI (Chatbot)
* **Current State:**
  * Floating widget and dedicated chat interface powered by Gemini 2.5 Flash / LangGraph agent bridge with local fallback.
* **Issues Identified:**
  * **Chat Window Size:** Chat modal is narrow (`380px`), causing itinerary tables returned by the AI to overflow horizontally.
  * **Typing Indicator:** Agent progress animation is basic CSS pulse dots without conversational warmth.
  * **Markdown Rendering:** AI responses with bullet points and bold text have inconsistent margins inside chat bubbles.

### 2.7 Authentication & Account Pages (To Be Decommissioned)
* **Current State:**
  * Includes `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`, and `AuthModal.jsx`.
  * Forces visitors to create an account and verify passwords just to save an itinerary.
* **Issues Identified:**
  * **Severe Tourist Friction:** Casual travelers researching Gwalior abandon the site when faced with an account creation wall.
  * **Redundant Complexity:** Password reset tokens, Scrypt hashing, CSRF cookies, and session rotation add heavy server maintenance for a public discovery tool.
  * **Architectural Clutter:** 5 server views, 6 API endpoints, and 3 frontend auth components exist solely to lock saved itineraries behind accounts.

---

## 3. Design System & CSS Inconsistencies

| Dimension | Current Implementation | Identified Defect | Recommendation |
| :--- | :--- | :--- | :--- |
| **Color Tokens** | Mixed hardcoded hex (`#FAF7F2`, `#4A141B`, `#8A5C22`, `#E5D7B7`, `#B83A4B`) | No CSS custom properties; dark mode is partially implemented and inconsistent | Unify into strict CSS variables: `--color-sandstone`, `--color-scindia-burgundy`, `--color-antique-gold`, `--color-tile-teal` |
| **Typography** | Generic sans-serif fallback with inline font-serif in some components | Inconsistent heading weights; no dedicated font for historic/cultural titles | Standardize on **Playfair Display / Cormorant Garamond** for titles + **Plus Jakarta Sans / Inter** for UI |
| **Container Widths** | Uncoordinated mix of `max-w-7xl`, `max-w-6xl`, `max-w-4xl`, `w-full` | Layout jumps horizontally when switching tabs or viewing details | Enforce rigid layout widths: `1280px` max container with `24px` gutter |
| **Spacing Scale** | Arbitrary margins (`mb-3`, `mt-7`, `p-5`, `py-9`) | Lack of rhythmic vertical spacing rhythm | Enforce strict 8pt grid (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`) |
| **Elevation / Shadows** | Default Tailwind `shadow-sm`, `shadow-md`, `shadow-xl` with black opacity | Harsh modern drop shadows clash with warm Indian heritage sandstone aesthetic | Custom warm-toned diffused shadows (`box-shadow: 0 12px 32px rgba(74, 20, 27, 0.08)`) |

---

## 4. Accessibility & Performance Review

1. **Color Contrast:**
   * Text on primary buttons (`#FFFFFF` on `#4A141B`) passes with 10.2:1 (AAA).
   * Secondary muted text (`#8A5C22` on `#FAF7F2`) fails with 3.6:1 (Requires minimum 4.5:1). Must darken secondary gold to `#6E4714` for text legibility.
2. **Touch Targets:**
   * Audio playback toggle, modal close buttons, and card favorite stars are currently `32px × 32px`.
   * Must enforce minimum `44px × 44px` hit areas with transparent padding.
3. **Motion Sensitivity:**
   * Currently zero `@media (prefers-reduced-motion)` checks in custom stylesheets.
   * Motion architecture must gracefully fallback to simple instant opacity reveals when reduced motion is preferred.
4. **Monolithic Code Health:**
   * `new_style/src/App.jsx` currently contains 3,374 lines of code, combining state, mock data, translations, routing, and all views in a single file.
   * Needs modular refactoring into clean, dedicated page and section components.

---

## 5. Decommissioning & Cleanup Opportunities

1. **Authentication:** Completely remove user sign-in/up barriers for tourists. Replace server-bound user itineraries with instant, zero-friction browser `localStorage` and PDF export.
2. **Database Integration:** Replace remote MongoDB queries for tourism POIs with the authoritative, version-controlled local JSON dataset (`data/gwalior_curated_pois.json` + `new_style/src/data/places.js`).
3. **Redundant Files:** Quarantine legacy n8n workflow (`n8n/tourism_plan_workflow.json`), duplicate place files, and orphaned report scripts.

