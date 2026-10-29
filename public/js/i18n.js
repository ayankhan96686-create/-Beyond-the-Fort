(function (root) {
  const STORAGE_KEY = 'beyond_fort_locale';
  const FALLBACK = 'en';
  let languages = [];
  let current = FALLBACK;
  let catalogs = {};
  let ready = false;
  let missing = new Set();
  const translate = (key, values = {}) => {
    const localized = catalogs[current]?.[key];
    if (current !== FALLBACK && localized == null && catalogs[FALLBACK]?.[key] != null) missing.add(`${current}:${key}`);
    const text = localized ?? catalogs[FALLBACK]?.[key];
    if (text == null) { missing.add(`${current}:${key}`); return key; }
    return String(text).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
  };
  async function load(code) {
    if (catalogs[code]) return catalogs[code];
    const response = await fetch(`/locales/${encodeURIComponent(code)}.json`);
    if (!response.ok) throw new Error(`Locale ${code} is unavailable`);
    catalogs[code] = await response.json();
    return catalogs[code];
  }
  function applyText() {
    document.querySelectorAll('[data-i18n]').forEach(node => {
      node.textContent = translate(node.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
      node.setAttribute('placeholder', translate(node.dataset.i18nPlaceholder));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(node => {
      node.setAttribute('aria-label', translate(node.dataset.i18nAriaLabel));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(node => {
      node.setAttribute('title', translate(node.dataset.i18nTitle));
    });
    document.documentElement.lang = current;
    document.documentElement.dir = languages.find(item => item.code === current)?.direction || 'ltr';
    const active = languages.find(item => item.code === current);
    document.querySelectorAll('[data-current-locale]').forEach(node => { node.textContent = active?.native || current.toUpperCase(); });
    document.querySelectorAll('[data-current-locale-code]').forEach(node => { node.textContent = current.toUpperCase(); });
    const menuButton = document.getElementById('mobileMenuToggle');
    if (menuButton) menuButton.setAttribute('aria-label', translate(menuButton.getAttribute('aria-expanded') === 'true' ? 'nav.closeMenu' : 'nav.openMenu'));
    document.dispatchEvent(new CustomEvent('beyondfort:languagechange', { detail: { locale: current, language: active } }));
  }
  async function setLanguage(code) {
    if (!languages.some(item => item.code === code)) code = FALLBACK;
    try { await load(code); }
    catch { code = FALLBACK; if (!catalogs[FALLBACK]) await load(FALLBACK); }
    current = code;
    try { localStorage.setItem(STORAGE_KEY, current); } catch {}
    missing = new Set();
    applyText();
    return current;
  }
  async function initialize() {
    try {
      const response = await fetch('/locales/languages.json');
      if (!response.ok) throw new Error('Language list unavailable');
      languages = await response.json();
    } catch { languages = [{ code: 'en', name: 'English', native: 'English', direction: 'ltr', group: 'International' }]; }
    try { await load(FALLBACK); } catch { catalogs[FALLBACK] = {}; }
    const requested = (() => { try { return localStorage.getItem(STORAGE_KEY) || FALLBACK; } catch { return FALLBACK; } })();
    await setLanguage(requested);
    ready = true;
    renderLanguageOptions();
  }
  function renderLanguageOptions(filter = '') {
    const list = document.getElementById('languageOptions');
    if (!list) return;
    const loading = document.getElementById('languageLoading');
    if (loading) loading.hidden = ready;
    list.hidden = !ready;
    if (!ready) return 0;
    const query = filter.trim().toLocaleLowerCase();
    const shown = languages.filter(item => `${item.name} ${item.native} ${item.code}`.toLocaleLowerCase().includes(query));
    list.replaceChildren();
    shown.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'language-option'; button.role = 'option';
      button.dataset.locale = item.code; button.setAttribute('aria-selected', String(item.code === current));
      button.innerHTML = `<span class="language-option-native" lang="${item.code}" dir="${item.direction}"></span><span class="language-option-meta"><span class="language-option-name"></span><span class="language-option-code"></span></span><span class="language-option-check" aria-hidden="true">✓</span>`;
      button.querySelector('.language-option-native').textContent = item.native;
      button.querySelector('.language-option-name').textContent = item.name;
      button.querySelector('.language-option-code').textContent = item.code.toUpperCase();
      button.addEventListener('click', async () => { await setLanguage(item.code); closeLanguagePopover(); document.getElementById('languageTrigger')?.focus(); });
      list.append(button);
    });
    const empty = document.getElementById('languageNoResults');
    if (empty) empty.hidden = shown.length > 0;
    return shown.length;
  }
  function openLanguagePopover() {
    const panel = document.getElementById('languagePopover'); const trigger = document.getElementById('languageTrigger');
    if (!panel || !trigger) return;
    panel.hidden = false; trigger.setAttribute('aria-expanded', 'true');
    renderLanguageOptions(document.getElementById('languageSearch')?.value || '');
    document.getElementById('languageSearch')?.focus();
  }
  function bindControls() {
    const trigger = document.getElementById('languageTrigger'); const menuButton = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('primaryNavigation'); const panel = document.getElementById('languagePopover');
    trigger?.addEventListener('click', () => panel?.hidden ? openLanguagePopover() : closeLanguagePopover());
    document.getElementById('languageClose')?.addEventListener('click', () => { closeLanguagePopover(); trigger?.focus(); });
    document.getElementById('languageSearch')?.addEventListener('input', event => renderLanguageOptions(event.target.value));
    document.addEventListener('click', event => { if (panel && !panel.hidden && !panel.contains(event.target) && !trigger?.contains(event.target)) closeLanguagePopover(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeLanguagePopover(); closeMobileMenu(); }
      if (!panel?.hidden && ['ArrowDown','ArrowUp'].includes(event.key)) {
        const options = [...panel.querySelectorAll('.language-option')]; const index = options.indexOf(document.activeElement);
        if (options.length) { event.preventDefault(); const next = index < 0 ? (event.key === 'ArrowDown' ? 0 : options.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length; options[next].focus(); }
      }
    });
    function closeMobileMenu() { if (!menu || !menuButton) return; menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label',translate('nav.openMenu')); }
    menuButton?.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menu?.classList.toggle('is-open', !expanded); menuButton.setAttribute('aria-expanded', String(!expanded));
      menuButton.setAttribute('aria-label', translate(expanded ? 'nav.openMenu' : 'nav.closeMenu'));
    });
    menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
    const search = document.getElementById('languageSearch');
    search?.addEventListener('keydown', event => {
      if (event.key === 'Enter') { const first = panel?.querySelector('.language-option'); if (first) { event.preventDefault(); first.click(); } }
    });
    const updateActiveLink = () => {
      const path = location.pathname;
      document.querySelectorAll('[data-nav-page]').forEach(link => {
        const page = link.dataset.navPage;
        const active = page === 'home' ? path === '/' && (!location.hash || location.hash === '#home') : page === 'discover' ? path === '/' && location.hash === '#discover' : page === 'planner' ? (path === '/' && location.hash === '#trip-planner') || path === '/itinerary' || path.startsWith('/attractions/') : page === 'chat' && path === '/chat';
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
      });
    };
    updateActiveLink();
    window.addEventListener('hashchange', updateActiveLink);
  }
  function closeLanguagePopover() {
    const panel = document.getElementById('languagePopover'); const trigger = document.getElementById('languageTrigger');
    if (!panel || !trigger) return;
    panel.hidden = true; trigger.setAttribute('aria-expanded', 'false');
  }
  root.BeyondI18n = {
    languages: () => languages.slice(), getLocale: () => current, setLanguage, t: translate,
    missingKeys: () => [...new Set([...missing, ...Object.keys(catalogs[FALLBACK] || {}).filter(key => catalogs[current]?.[key] == null).map(key => `${current}:${key}`)])],
    refresh: applyText
  };
  document.addEventListener('DOMContentLoaded', () => { bindControls(); initialize(); });
})(window);
