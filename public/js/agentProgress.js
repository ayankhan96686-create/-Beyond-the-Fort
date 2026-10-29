(function (root, factory) {
  const createAgentProgress = factory();
  if (typeof module === 'object' && module.exports) module.exports = createAgentProgress;
  else root.createAgentProgress = createAgentProgress;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const stages = [
    { agent: 'Manager Agent', icon: '◎', message: 'Understanding your travel preferences…', key: 'manager' },
    { agent: 'Research Agent', icon: '⌕', message: 'Discovering the best places around you…', key: 'research' },
    { agent: 'Route & Time Agent', icon: '⌁', message: 'Calculating distances and travel time…', key: 'route' },
    { agent: 'Verification Agent', icon: '✓', message: 'Checking available information and route details…', key: 'verify' },
    { agent: 'Itinerary & Optimization Agent', icon: '▤', message: 'Optimizing your personalized itinerary…', key: 'optimize' }
  ];

  return function createAgentProgress(elements, options = {}) {
    const now = options.now || (() => Date.now());
    const every = options.setInterval || ((callback, delay) => setInterval(callback, delay));
    const cancel = options.clearInterval || (timer => clearInterval(timer));
    let timer = null;
    let startedAt = 0;
    let active = false;
    let waiting = false;
    const t = (key, fallback) => {
      const value = typeof window !== 'undefined' ? window.BeyondI18n?.t(key) : null;
      return !value || value === key ? fallback : value;
    };

    function render() {
      const elapsed = Math.max(0, now() - startedAt);
      if (elapsed >= 5000) {
        cancel(timer);
        timer = null;
        active = false;
        waiting = true;
        elements.fill.style.width = '100%';
        elements.progress.setAttribute('aria-valuenow', '100');
        elements.percent.textContent = '100%';
        elements.root.classList.add('is-waiting');
        elements.agent.textContent = t('planner.stillPlanningTitle', 'Planning is taking a little longer');
        elements.icon.textContent = '…';
        elements.message.textContent = t('planner.stillPlanning', 'Still planning your route…');
        elements.progress.hidden = true;
        return;
      }
      const stageIndex = Math.min(stages.length - 1, Math.floor(elapsed / 1000));
      const progress = Math.floor(elapsed / 50);
      const stage = stages[stageIndex];
      waiting = false;
      elements.root.classList.remove('is-waiting');
      elements.agent.textContent = t(`planner.agentName.${stage.key}`, stage.agent);
      elements.icon.textContent = stage.icon;
      elements.message.textContent = t(`planner.agent.${stage.key}`, stage.message);
      elements.fill.style.width = `${progress}%`;
      elements.progress.setAttribute('aria-valuenow', String(progress));
      elements.percent.textContent = `${progress}%`;
    }

    if (typeof document !== 'undefined') document.addEventListener('beyondfort:languagechange', () => { if (!elements.root.hidden) render(); });
    return {
      start() {
        if (active) return false;
        active = true;
        startedAt = now();
        elements.root.hidden = false;
        waiting = false;
        elements.progress.hidden = false;
        render();
        timer = every(render, 100);
        return true;
      },
      stop() {
        if (timer !== null) cancel(timer);
        timer = null;
        const wasActive = active || !elements.root.hidden;
        active = false;
        elements.root.hidden = true;
        elements.root.classList.remove('is-waiting');
        waiting = false;
        return wasActive;
      },
      get active() { return active; }
    };
  };
});
