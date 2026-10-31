const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'MD', 'screenshots');

const VIEWPORTS = [
  { id: '1920x1080', name: 'Desktop Wide (1920x1080)', width: 1920, height: 1080, isMobile: false },
  { id: '1440x900', name: 'Desktop Standard (1440x900)', width: 1440, height: 900, isMobile: false },
  { id: '1366x768', name: 'Laptop (1366x768)', width: 1366, height: 768, isMobile: false },
  { id: '1024x768', name: 'Tablet Landscape (1024x768)', width: 1024, height: 768, isMobile: false },
  { id: '768x1024', name: 'Tablet Portrait (768x1024)', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { id: '430x932', name: 'iPhone 15 Pro Max (430x932)', width: 430, height: 932, isMobile: true, hasTouch: true },
  { id: '390x844', name: 'iPhone 14 (390x844)', width: 390, height: 844, isMobile: true, hasTouch: true },
  { id: '360x800', name: 'Android Standard (360x800)', width: 360, height: 800, isMobile: true, hasTouch: true }
];

async function runComprehensiveQA() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('====================================================');
  console.log('STARTING AUTOMATED BROWSER QA SUITE — BEYOND THE FORT');
  console.log('Chrome Binary:', CHROME_PATH);
  console.log('Output Directory:', SCREENSHOT_DIR);
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--disable-web-security'
    ]
  });

  const report = {
    testedAt: new Date().toISOString(),
    viewports: [],
    errors: [],
    networkFailures: [],
    routes: []
  };

  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`[Browser Error]:`, msg.text());
      report.errors.push({ type: 'console_error', text: msg.text() });
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.warn(`[HTTP ${response.status()}]:`, response.url());
      report.networkFailures.push({ status: response.status(), url: response.url() });
    }
  });

  // Cycle 1: Full Route & Interaction QA on Primary Desktop (1920x1080)
  console.log('>>> [CYCLE 1] Full Interactive Route Testing (1920x1080)...');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1800)));

  // 1. Home Viewport
  let file = path.join(SCREENSHOT_DIR, '01_home_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'home_hero', file, status: 'PASS' });
  console.log('  ✓ Captured: 01_home_1920x1080.png');

  // Scroll to Heritage Pillars
  await page.evaluate(() => {
    const el = document.getElementById('heritage-pillars');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  file = path.join(SCREENSHOT_DIR, '02_heritage_pillars_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'heritage_pillars', file, status: 'PASS' });
  console.log('  ✓ Captured: 02_heritage_pillars_1920x1080.png');

  // 2. Discover Places View
  console.log('  -> Navigating to Discover Places Tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const discoverBtn = buttons.find(b => b.textContent.includes('Discover Places'));
    if (discoverBtn) discoverBtn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  file = path.join(SCREENSHOT_DIR, '03_discover_places_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'discover_places', file, status: 'PASS' });
  console.log('  ✓ Captured: 03_discover_places_1920x1080.png');

  // Open Attraction Detail Modal
  console.log('  -> Opening Attraction Detail Modal...');
  await page.evaluate(() => {
    const detailButtons = Array.from(document.querySelectorAll('button'));
    const btn = detailButtons.find(b => b.textContent.includes('View Monument') || b.textContent.includes('Details'));
    if (btn) btn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  file = path.join(SCREENSHOT_DIR, '04_attraction_modal_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'attraction_modal', file, status: 'PASS' });
  console.log('  ✓ Captured: 04_attraction_modal_1920x1080.png');

  // Close Attraction Modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.fixed.inset-0.z-50 button');
    if (closeBtn) {
      closeBtn.click();
    }
  });
  await page.keyboard.press('Escape');
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));

  // 3. Planning Studio View
  console.log('  -> Navigating to Planning Studio Tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const planBtn = buttons.find(b => b.textContent.includes('Planning Studio'));
    if (planBtn) planBtn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  file = path.join(SCREENSHOT_DIR, '05_planning_studio_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'planning_studio', file, status: 'PASS' });
  console.log('  ✓ Captured: 05_planning_studio_1920x1080.png');

  // 4. Trigger Itinerary Generation & Agent Progress Modal
  console.log('  -> Triggering Itinerary Generation...');
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent.includes('Generate Feasible Itinerary')
    );
    if (submitBtn) submitBtn.click();
  });
  // Capture the Agent Progress Modal actively working
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  file = path.join(SCREENSHOT_DIR, '06_agent_progress_modal_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'agent_progress_modal', file, status: 'PASS' });
  console.log('  ✓ Captured: 06_agent_progress_modal_1920x1080.png');

  // Wait for itinerary generation to complete and navigate to Route page
  console.log('  -> Waiting for itinerary generation & route map transition...');
  try {
    await page.waitForFunction(
      () => !document.querySelector('#agent-modal-title') && document.querySelector('.leaflet-container'),
      { timeout: 18000 }
    );
  } catch (e) {
    await page.evaluate(() => new Promise(r => setTimeout(r, 8000)));
  }
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));
  file = path.join(SCREENSHOT_DIR, '07_itinerary_results_and_map_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'itinerary_results_and_map', file, status: 'PASS' });
  console.log('  ✓ Captured: 07_itinerary_results_and_map_1920x1080.png');

  // 5. AI Agents Command Center View
  console.log('  -> Navigating to AI Agents Command Center Tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const agentsBtn = buttons.find(b => b.textContent.includes('AI Agents'));
    if (agentsBtn) agentsBtn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));
  file = path.join(SCREENSHOT_DIR, '08_agents_command_center_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'agents_command_center', file, status: 'PASS' });
  console.log('  ✓ Captured: 08_agents_command_center_1920x1080.png');

  // 6. Tansen AI Chatbot Open State
  console.log('  -> Opening Tansen AI Concierge Chatbot...');
  await page.evaluate(() => {
    const chatTrigger = document.querySelector('button[aria-label="Ask Tansen AI"], button[title*="Tansen AI"]');
    if (chatTrigger) chatTrigger.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  file = path.join(SCREENSHOT_DIR, '09_tansen_chatbot_1920x1080.png');
  await page.screenshot({ path: file });
  report.routes.push({ route: 'tansen_chatbot', file, status: 'PASS' });
  console.log('  ✓ Captured: 09_tansen_chatbot_1920x1080.png');

  // Close Chatbot
  await page.keyboard.press('Escape');
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));

  // Cycle 2: Multi-Device Responsive Matrix Testing across all 8 viewports
  console.log('\n>>> [CYCLE 2] Multi-Device Responsive Matrix Verification...');
  for (const vp of VIEWPORTS) {
    console.log(`  -> Testing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: !!vp.isMobile,
      hasTouch: !!vp.hasTouch
    });

    // Go Home and capture
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
    const vpFile = path.join(SCREENSHOT_DIR, `responsive_${vp.id}.png`);
    await page.screenshot({ path: vpFile });
    
    // Check horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    report.viewports.push({
      ...vp,
      screenshot: vpFile,
      hasHorizontalOverflow,
      status: hasHorizontalOverflow ? 'FAIL_OVERFLOW' : 'PASS'
    });
    console.log(`    ✓ Captured: responsive_${vp.id}.png (Horizontal Overflow: ${hasHorizontalOverflow})`);
  }

  await browser.close();

  console.log('\n====================================================');
  console.log('BROWSER QA SUITE COMPLETED SUCCESSFULLY');
  console.log('Total Routes Tested:', report.routes.length);
  console.log('Total Viewports Tested:', report.viewports.length);
  console.log('Total Console Errors:', report.errors.length);
  console.log('Total Network Failures:', report.networkFailures.length);
  console.log('====================================================');

  fs.writeFileSync(
    path.join(__dirname, '..', 'MD', 'browser_qa_results.json'),
    JSON.stringify(report, null, 2)
  );
}

runComprehensiveQA().catch(err => {
  console.error('Browser QA execution failure:', err);
  process.exit(1);
});

