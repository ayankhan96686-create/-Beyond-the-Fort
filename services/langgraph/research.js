/**
 * Agent 2: Research & POI Discovery
 * Recreated natively in JavaScript from Python agents/research.py
 */

const fs = require('fs');
const path = require('path');

function resolveDataPath(filename) {
  const candidates = [
    path.resolve(__dirname, '../../data', filename),
    path.resolve(__dirname, '../data', filename),
    path.resolve(process.cwd(), 'data', filename),
    path.resolve(process.cwd(), '../data', filename)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

const DATASET_PATH = resolveDataPath('gwalior_curated_pois.json');
const SUPPLEMENTAL_DATASET_PATH = resolveDataPath('beyond_the_fort_places.json');
const SUPPLEMENTAL_DWELL_MINUTES = 30;
const MAX_RESEARCH_CANDIDATES = 6;

const IMAGE_ASSETS = {
  'chanderi': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg/960px-Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg',
    image_credit: 'Shoot stufz / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg',
    image_license: 'CC BY-SA 4.0',
    image_caption: 'Master artisan weaving genuine Chanderi silk saree on a traditional pit loom'
  },
  'kachori': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Kachori-sabzi.jpg/960px-Kachori-sabzi.jpg',
    image_credit: 'Priyanka nawalramka / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Kachori-sabzi.jpg',
    image_license: 'CC BY-SA 4.0',
    image_caption: 'Authentic Bedai and crisp spiced Urad-dal Kachori served with hing potato gravy'
  },
  'bedai': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Kachori-sabzi.jpg/960px-Kachori-sabzi.jpg',
    image_credit: 'Priyanka nawalramka / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Kachori-sabzi.jpg',
    image_license: 'CC BY-SA 4.0',
    image_caption: 'Authentic Bedai and crisp spiced Urad-dal Kachori served with hing potato gravy'
  },
  'maharaj bada': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Maharaj_Bada_Gwalior.jpg/960px-Maharaj_Bada_Gwalior.jpg',
    image_credit: 'Neerajshivpuri / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Maharaj_Bada_Gwalior.jpg',
    image_license: 'CC BY-SA 4.0',
    image_caption: 'Historic Maharaj Bada square, bustling center of Gwalior metal and stone craft guilds'
  },
  'tansen': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Tomb_of_Tansen.jpg/960px-Tomb_of_Tansen.jpg',
    image_credit: 'Simon Wagner / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Tomb_of_Tansen.jpg',
    image_license: 'CC BY-SA 2.5',
    image_caption: 'Tomb of Mian Tansen, cultural sanctum of Gwalior Gharana classical Dhrupad music'
  },
  'gajak': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg/960px-Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg',
    image_credit: 'Billjones94 / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Gur_Rewari_(a_kind_of_Gajak)_from_Lucknow,_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg',
    image_license: 'CC BY-SA 4.0',
    image_caption: 'Artisanal hand-pounded sesame and jaggery Gwaliori Gajak brittle'
  },
  'zari': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg/960px-Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg',
    image_credit: 'Zarood / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Close_Shot_of_the_Zardozi_(Zardouzi)_Embroidery_Cushion_Covers.jpg',
    image_license: 'CC BY-SA 3.0',
    image_caption: 'Generational master artisans executing royal court Zari & Zardozi gold embroidery'
  },
  'zardozi': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg/960px-Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg',
    image_credit: 'Zarood / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Close_Shot_of_the_Zardozi_(Zardouzi)_Embroidery_Cushion_Covers.jpg',
    image_license: 'CC BY-SA 3.0',
    image_caption: 'Generational master artisans executing royal court Zari & Zardozi gold embroidery'
  },
  'sarafa': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Lac_Bangles_making_Hyderabad_%2823718%29.jpg/960px-Lac_Bangles_making_Hyderabad_%2823718%29.jpg',
    image_credit: 'PJeganathan / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Lac_Bangles_making_Hyderabad_(23718).jpg',
    image_license: 'CC BY-SA 3.0',
    image_caption: 'Sarafa bazaar artisans flame-shaping melted natural lac bangles and silver filigree'
  },
  'lac': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Lac_Bangles_making_Hyderabad_%2823718%29.jpg/960px-Lac_Bangles_making_Hyderabad_%2823718%29.jpg',
    image_credit: 'PJeganathan / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Lac_Bangles_making_Hyderabad_(23718).jpg',
    image_license: 'CC BY-SA 3.0',
    image_caption: 'Sarafa bazaar artisans flame-shaping melted natural lac bangles and silver filigree'
  },
  'pottery': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg/960px-Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg',
    image_credit: 'Gannu03 / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg',
    image_license: 'CC BY-SA 4.0',
    image_caption: 'Daulat Ganj potter spinning unglazed Chambal river clay urns on a traditional wheel'
  },
  'jai vilas': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/DUrbar_hall_at_jai_vilas_palace.JPG/960px-DUrbar_hall_at_jai_vilas_palace.JPG',
    image_credit: 'Adityajoardar9 / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:DUrbar_hall_at_jai_vilas_palace.JPG',
    image_license: 'CC BY-SA 3.0',
    image_caption: 'Durbar Hall inside Jai Vilas Palace'
  },
  'scindia museum': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/DUrbar_hall_at_jai_vilas_palace.JPG/960px-DUrbar_hall_at_jai_vilas_palace.JPG',
    image_credit: 'Adityajoardar9 / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:DUrbar_hall_at_jai_vilas_palace.JPG',
    image_license: 'CC BY-SA 3.0',
    image_caption: 'Scindia Museum is housed inside Jai Vilas Palace'
  },
  'fort': {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Gwalior_fort_panorama.jpg/960px-Gwalior_fort_panorama.jpg',
    image_credit: 'Pavel Suprun / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Gwalior_fort_panorama.jpg',
    image_license: 'CC BY-SA 3.0',
    image_caption: 'Gwalior Fort panorama and ancient ramparts'
  }
};

function getImageAsset(name, category) {
  const norm = String(name || '').toLowerCase();
  for (const [match, asset] of Object.entries(IMAGE_ASSETS)) {
    if (norm.includes(match)) return asset;
  }
  return {
    image_url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Gwalior_fort_panorama.jpg/960px-Gwalior_fort_panorama.jpg',
    image_credit: 'Pavel Suprun / Wikimedia Commons',
    image_source_url: 'https://commons.wikimedia.org/wiki/File:Gwalior_fort_panorama.jpg',
    image_license: 'CC BY-SA 3.0',
    image_caption: 'Illustrative Gwalior Fort historic landscape'
  };
}

function adaptSupplementalRecord(row) {
  const rawCategories = [String(row.category || ''), ...(row.categories || []).map(String)];
  const categoryText = rawCategories.join(' ').toLowerCase();
  let category = null;
  if (/craft|handicraft|handloom|textile|weaving|artist|art gallery/.test(categoryText)) {
    category = 'crafts';
  } else if (/restaurant|food|cafe|bakery|culinary/.test(categoryText)) {
    category = 'culinary';
  } else if (/music|dhrupad|performing art/.test(categoryText)) {
    category = 'music';
  } else if (/tourist attraction|historical|heritage|museum|fort|palace|temple|archaeological|monument|gurudwara|church|mosque|aquarium|garden|park|library/.test(categoryText)) {
    category = 'heritage';
  }
  const hours = row.openingHours || null;
  return {
    id: row.id,
    name: row.name,
    category,
    subCategory: row.category,
    description: row.sourceSearch || '',
    coordinates: { lat: row.latitude, lng: row.longitude },
    city: row.city || 'Gwalior',
    address: row.address,
    min_dwell_time_mins: SUPPLEMENTAL_DWELL_MINUTES,
    duration_estimate_type: 'heuristic_default',
    operating_hours: hours,
    verification_status: 'UNVERIFIED_GOOGLE_MAPS_SCRAPE',
    source_reference: 'User-provided Beyond the Fort Apify Google Maps export',
    source_url: row.googleMapsUrl,
    source_search: row.sourceSearch,
    rating: row.rating,
    review_count: row.reviewCount,
    data_note: row.dataNote || 'Scraped listing; verify details before public use.',
    ...getImageAsset(row.name, category)
  };
}

function loadCuratedDataset() {
  const rows = [];
  try {
    if (fs.existsSync(DATASET_PATH)) {
      const data = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf-8'));
      rows.push(...data);
    }
  } catch (e) {
    console.error('Error reading curated POI dataset:', e.message);
  }
  try {
    if (fs.existsSync(SUPPLEMENTAL_DATASET_PATH)) {
      const supp = JSON.parse(fs.readFileSync(SUPPLEMENTAL_DATASET_PATH, 'utf-8'));
      rows.push(...supp.map(adaptSupplementalRecord));
    }
  } catch (e) {
    console.error('Error reading supplemental dataset:', e.message);
  }
  return rows;
}

function tokens(text) {
  const matches = String(text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
  return new Set(matches.filter(x => x.length > 2));
}

function researchNode(state) {
  const c = state.constraints || {};
  const interests = c.interests || [];
  const terms = new Set();
  for (const item of interests) {
    for (const t of tokens(String(item))) terms.add(t);
  }

  const categoryMap = {
    food: 'culinary', eat: 'culinary', khana: 'culinary', culinary: 'culinary',
    craft: 'crafts', crafts: 'crafts', textile: 'crafts', weaving: 'crafts', silk: 'crafts', jewellery: 'crafts', jewelry: 'crafts',
    music: 'music', dhrupad: 'music', heritage: 'heritage', site: 'heritage', sites: 'heritage'
  };

  const wanted = new Set();
  for (const [token, cat] of Object.entries(categoryMap)) {
    if (terms.has(token)) wanted.add(cat);
  }
  if (wanted.has('music') && wanted.has('heritage')) {
    wanted.delete('heritage');
  }

  const broadTerms = new Set([
    'craft', 'crafts', 'textile', 'weaving', 'food', 'culinary', 'music', 'heritage',
    'site', 'sites', 'jewellery', 'jewelry', 'local', 'all', 'mujhe', 'hai', 'khana',
    'dikhana', 'dekhna', 'want', 'would', 'like', 'try', 'see', 'visit', 'explore',
    'experience', 'meet', 'please', 'some', 'in', 'aaj'
  ]);

  const hasSpecificInterest = Array.from(terms).some(t => !broadTerms.has(t));
  const allRows = loadCuratedDataset();
  const found = [];
  const incomplete = [];
  let supplementalMatches = 0;

  for (const row of allRows) {
    if (row.synthetic || row.is_placeholder || row.record_type === 'synthetic' || !row.category) continue;
    if (String(row.city || 'Gwalior').toLowerCase() !== String(c.city || 'Gwalior').toLowerCase()) continue;
    const coords = row.coordinates || {};
    if (!row.id || !row.name || !row.min_dwell_time_mins || coords.lat === undefined || coords.lng === undefined) {
      incomplete.push(row.name || row.id || 'Unnamed record');
      continue;
    }

    const text = [row.name, row.hindiName, row.category, row.subCategory, row.description, row.highlights, row.source_search]
      .filter(Boolean)
      .join(' ');
    const rowTerms = tokens(text);
    const cat = String(row.category || '').toLowerCase();

    const categoryMatch = wanted.size > 0 && wanted.has(cat) && !hasSpecificInterest;
    const lexicalMatch = Array.from(terms).some(t => rowTerms.has(t));

    if (!(categoryMatch || (lexicalMatch && hasSpecificInterest))) continue;

    const candidate = {};
    for (const k of [
      'id', 'name', 'category', 'subCategory', 'description', 'coordinates',
      'image_url', 'image_caption', 'image_credit', 'image_source_url', 'image_license',
      'images', 'city', 'address', 'entry_fee', 'min_dwell_time_mins', 'duration_estimate_type',
      'operating_hours', 'verification_status', 'source_reference', 'source_url', 'source_urls',
      'last_audited', 'community_rules', 'highlights', 'cost_estimate', 'data_note',
      'rating', 'review_count'
    ]) {
      if (row[k] !== undefined) candidate[k] = row[k];
    }
    if (!candidate.image_url) {
      Object.assign(candidate, getImageAsset(candidate.name, candidate.category));
    }
    found.push(candidate);
    if (row.duration_estimate_type === 'heuristic_default') supplementalMatches++;
    if (found.length >= MAX_RESEARCH_CANDIDATES) break;
  }

  const warnings = [...(state.warnings || [])];
  if (supplementalMatches) {
    warnings.push(`${supplementalMatches} matching imported listings are unverified Google Maps scrapes. Their 30-minute visit durations are planning defaults, not source-verified facts.`);
  }
  if (found.length >= MAX_RESEARCH_CANDIDATES) {
    warnings.push(`Research results are limited to the first ${MAX_RESEARCH_CANDIDATES} matching records to keep live route lookups bounded.`);
  }
  if (incomplete.length) {
    warnings.push(`Excluded ${incomplete.length} dataset record(s) missing an ID, name, coordinates, or visit-duration estimate; values were not invented.`);
  }

  const trace = [...(state.agent_trace || [])];
  trace.push(`[Research] Matched ${found.length} non-placeholder records across curated and imported Gwalior datasets`);

  return {
    candidates: found,
    agent_trace: trace,
    warnings
  };
}

module.exports = {
  researchNode,
  loadCuratedDataset
};

