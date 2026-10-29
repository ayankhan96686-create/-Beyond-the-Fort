const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ejs = require('ejs');

const root = path.resolve(__dirname, '..');
const localeDir = path.join(root, 'public', 'locales');
const languages = JSON.parse(fs.readFileSync(path.join(localeDir, 'languages.json'), 'utf8'));

test('locale manifest contains exactly 15 Indian and 6 international languages', () => {
  assert.equal(languages.length, 21);
  assert.equal(new Set(languages.map(language => language.code)).size, 21);
  assert.equal(languages.filter(language => language.group === 'Indian').length, 15);
  assert.equal(languages.filter(language => language.group === 'International').length, 6);
  assert.ok(languages.every(language => fs.existsSync(path.join(localeDir, `${language.code}.json`))));
});

test('every locale catalog is valid and includes the primary navigation', () => {
  for (const language of languages) {
    const catalog = JSON.parse(fs.readFileSync(path.join(localeDir, `${language.code}.json`), 'utf8'));
    for (const key of ['nav.home', 'nav.discover', 'nav.planVisit', 'nav.ask', 'nav.planCta']) {
      assert.equal(typeof catalog[key], 'string', `${language.code} is missing ${key}`);
    }
  }
});

test('Urdu and Arabic use RTL while other listed locales remain LTR', () => {
  assert.equal(languages.find(language => language.code === 'ur').direction, 'rtl');
  assert.equal(languages.find(language => language.code === 'ar').direction, 'rtl');
  assert.ok(languages.filter(language => !['ur', 'ar'].includes(language.code)).every(language => language.direction === 'ltr'));
});

test('all rendered pages use the shared navbar and load the locale client', () => {
  const pages = ['index.ejs', 'chat.ejs', 'itinerary.ejs', 'attraction.ejs', 'results.ejs'];
  for (const page of pages) {
    const source = fs.readFileSync(path.join(root, 'views', page), 'utf8');
    assert.match(source, /include\('partials\/navbar'\)/, `${page} does not include shared navbar`);
    assert.match(source, /\/js\/i18n\.js/, `${page} does not load locale client`);
    ejs.compile(source, { filename: path.join(root, 'views', page) });
  }
});

test('chat client sends the selected locale and explicit plan intent to the existing API', () => {
  const source = fs.readFileSync(path.join(root, 'public', 'js', 'chat.js'), 'utf8');
  assert.match(source, /locale:\s*window\.BeyondI18n\?\.getLocale\(\)/);
  assert.match(source, /intent === 'plan'/);
  const chat = require('../services/chatService');
  assert.equal(chat.isPlanningRequest('Plan this visit', true), true);
});
