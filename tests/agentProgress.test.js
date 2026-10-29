const { test } = require('node:test');
const assert = require('node:assert/strict');
const createAgentProgress = require('../public/js/agentProgress');

function fixture() {
  let currentTime = 0;
  let intervalCallback;
  let cleared = false;
  const elements = {
    root: { hidden: true, classes: new Set(), classList: {
      add(name) { elements.root.classes.add(name); },
      remove(name) { elements.root.classes.delete(name); }
    } },
    agent: { textContent: '' }, icon: { textContent: '' }, message: { textContent: '' },
    progress: { hidden: false, value: '', setAttribute(name, value) { if (name === 'aria-valuenow') this.value = value; } },
    fill: { style: {} }, percent: { textContent: '' }
  };
  const controller = createAgentProgress(elements, {
    now: () => currentTime,
    setInterval(callback) { intervalCallback = callback; return 1; },
    clearInterval() { cleared = true; }
  });
  return {
    elements, controller,
    advance(ms) { currentTime += ms; intervalCallback?.(); },
    get cleared() { return cleared; }
  };
}

test('agent stages change at one-second boundaries and finish their visual progress within five seconds', () => {
  const ui = fixture();
  assert.equal(ui.controller.start(), true);
  assert.equal(ui.elements.agent.textContent, 'Manager Agent');
  assert.equal(ui.elements.message.textContent, 'Understanding your travel preferences…');
  const expected = [
    ['Research Agent', 'Discovering the best places around you…'],
    ['Route & Time Agent', 'Calculating distances and travel time…'],
    ['Verification Agent', 'Checking available information and route details…'],
    ['Itinerary & Optimization Agent', 'Optimizing your personalized itinerary…']
  ];
  expected.forEach(([agent, message], index) => {
    ui.advance(1000);
    assert.equal(ui.elements.agent.textContent, agent, `stage ${index + 2}`);
    assert.equal(ui.elements.message.textContent, message);
    assert.equal(Number(ui.elements.progress.value), (index + 1) * 20);
  });
  ui.advance(999);
  assert.equal(ui.elements.root.classes.has('is-waiting'), false);
  ui.advance(1);
  assert.equal(ui.cleared, true);
  assert.equal(ui.elements.agent.textContent, 'Planning is taking a little longer');
  assert.equal(ui.elements.message.textContent, 'Still planning your route…');
  assert.equal(ui.elements.progress.value, '100');
  assert.equal(ui.elements.percent.textContent, '100%');
  assert.equal(ui.elements.progress.hidden, true);
  assert.equal(ui.elements.root.hidden, false);
  ui.advance(10000);
  assert.equal(ui.elements.message.textContent, 'Still planning your route…');
});

test('a fast API completion clears the animation and duplicate starts are ignored', () => {
  const ui = fixture();
  assert.equal(ui.controller.start(), true);
  assert.equal(ui.controller.start(), false);
  ui.advance(420);
  assert.equal(ui.controller.stop(), true);
  assert.equal(ui.elements.root.hidden, true);
  assert.equal(ui.cleared, true);
  assert.equal(ui.controller.stop(), false);
});

test('a slow request keeps only the subtle waiting status until the real response clears it', () => {
  const ui = fixture();
  ui.controller.start();
  ui.advance(5000);
  assert.equal(ui.elements.message.textContent, 'Still planning your route…');
  assert.equal(ui.elements.root.hidden, false);
  assert.equal(ui.controller.active, false);
  ui.advance(2500);
  assert.equal(ui.elements.message.textContent, 'Still planning your route…');
  ui.controller.stop();
  assert.equal(ui.elements.root.hidden, true);
});

test('responsive and reduced-motion styles are present for the progress UI', () => {
  const fs = require('node:fs');
  const css = fs.readFileSync(require.resolve('../public/css/style.css'), 'utf8');
  assert.match(css, /@media \(max-width: 520px\)[^{]*\{[^}]*\.agent-progress/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[^{]*\{[^}]*\.agent-progress-icon/s);
});
