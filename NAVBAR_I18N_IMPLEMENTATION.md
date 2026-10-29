# Beyond the Fort navbar and language support

## Implemented

- Replaced the duplicated headers on Home, Chat, Itinerary, Attraction Details, and the legacy Results view with `views/partials/navbar.ejs`.
- Kept the existing cream, burgundy, gold, heritage crest, routes, and theme preference. The theme button now keeps its SVG icons and updates its accessible name with the chosen locale.
- Added a compact tablet/mobile menu with large tap targets. Selecting a navigation link closes it. The language panel supports native-script names, search by English/native name or code, current-language indication, keyboard navigation, Escape, outside-click close, and close button.
- Added exactly 21 locale options. The preference is stored in `localStorage` under `beyond_fort_locale`; switching language updates the current page without reloading and does not alter form values or request enum values.
- Set the document `lang` and `dir` from the locale manifest. Urdu and Arabic use RTL. Map canvases stay LTR so Leaflet controls and map coordinates remain in their expected orientation.
- Added locale context to the existing `/api/chat` payload. The Gemini tourism answer prompt asks for the selected language while preserving verified attraction names and the existing evidence-only rules. The planning shortcut can also carry an explicit `intent: "plan"`, so the translated suggestion still reaches the existing planner.
- Added a runtime missing-key report: `BeyondI18n.missingKeys()` lists catalog keys that fell back to English for the selected locale.

## Supported locales

The 15 Indian locales are Hindi (`hi`), Bengali (`bn`), Telugu (`te`), Marathi (`mr`), Tamil (`ta`), Urdu (`ur`), Gujarati (`gu`), Kannada (`kn`), Odia (`or`), Malayalam (`ml`), Punjabi (`pa`), Assamese (`as`), Maithili (`mai`), Sanskrit (`sa`), and Kashmiri (`ks`).

The six international locales are English (`en`), French (`fr`), German (`de`), Spanish (`es`), Arabic (`ar`), and Simplified Chinese (`zh`). The `or` code is the existing language tag used for Odia in this project.

## Locale file structure

- `public/locales/languages.json` is the selector manifest. Each record contains `code`, English `name`, native-script `native`, `direction`, and `group`.
- `public/locales/en.json` is the fallback catalog and lists keys as flat dotted names such as `nav.home` and `planner.build`.
- The other 20 `public/locales/<code>.json` files override keys for that language. Missing keys safely use the English catalog; a missing key in both catalogs returns the key name.
- `public/js/i18n.js` loads catalogs on demand and exposes `window.BeyondI18n` (`setLanguage`, `getLocale`, `t`, `languages`, `refresh`, and `missingKeys`). Add `data-i18n`, `data-i18n-placeholder`, `data-i18n-aria-label`, or `data-i18n-title` to markup for translated text/attributes.

To add a translation, add its key to `en.json` first, then add the translated value to each locale catalog. Preserve machine values, endpoint paths, identifiers, and official place names. Use the native script for the visible locale label. Add RTL to the manifest only for locales whose chosen script is right-to-left, then review forms, menus, maps, and chat in that direction.

## Translation coverage and limits

This is a functioning locale selector and a partial translation rollout; it is **not full-application translation coverage**. All 21 catalogs currently translate the primary navbar labels. Localized planner/chat catalogs cover a core subset, with coverage varying by locale. Static home/discovery copy, many location-control/help texts, interest/companion/transport labels, itinerary and attraction detail copy, map controls, long POI descriptions, and some client/server validation and error messages still appear in English. English is the deliberate fallback for these missing keys.

The AI's ordinary tourism answers receive the selected locale and are instructed to answer in it when Gemini is available. Deterministic planner result text, returned errors and structured itinerary facts are not translated by Gemini. They can remain in English. Gemini failures continue through the existing 503 behavior; selecting a language does not hide or replace that failure.

The UI uses the existing Plus Jakarta Sans/Cinzel web fonts with system sans-serif fallbacks. Font coverage depends on installed/system fallback fonts for some Indian scripts; no new font or third-party runtime library was added.

## Verification

- `npm test`: PASS, 23 tests including new locale manifest/catalog, shared-navbar, and chat-locale checks.
- `node --check`: PASS for the changed browser and service JavaScript files.
- Running browser preview at `http://127.0.0.1:3002/`: PASS for shared navbar visibility and 21 native-script choices. Selected Urdu; navbar and planner labels changed, `document.documentElement.lang` was `ur`, `dir` was `rtl`, and Urdu remained selected after refresh.
- Desktop screenshot review: PASS. The existing dark theme preference was active during the capture.
- Mobile responsive preview: PASS in a narrow emulated viewport. Header stayed within the viewport, language trigger remained available, and the hamburger opened the Home, Discover, Plan, and Ask Tansen links. The 820px tablet breakpoint is implemented but was not separately inspected.
- Itinerary API smoke: PASS. `http://127.0.0.1:8000/health` reported healthy; a real POST to the existing Node planner endpoint returned an itinerary with live Mapbox route legs and agent trace. The response included warnings that some imported attraction records/hours are unverified. This current smoke did not reproduce the earlier `Tourism planning service unavailable` message.
- `package.json` has no separate lint or build script; Node syntax checks and the test suite are the available checks.
