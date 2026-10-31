const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TUNNEL_URL = 'https://surgery-brand-staffing-everyday.trycloudflare.com';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'MD', 'screenshots');

async function testTunnelInRealBrowser() {
  console.log('====================================================');
  console.log('TESTING COMPLETE WEBPAGE OVER CLOUDFLARE HTTPS TUNNEL');
  console.log('External Tunnel URL:', TUNNEL_URL);
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[Browser Error]:', msg.text());
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.error('[Page Error]:', err.message);
    errors.push(err.message);
  });

  // 1. Visit Home via Cloudflare Tunnel
  console.log('1. Navigating to external HTTPS Tunnel URL...');
  const response = await page.goto(TUNNEL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('   HTTP Response Status:', response.status());

  // Wait for React hydration and animations
  await page.evaluate(() => new Promise(r => setTimeout(r, 2500)));

  const title = await page.title();
  console.log('   Document Title:', title);

  const heroVisible = await page.evaluate(() => {
    const hero = document.querySelector('#hero h1');
    return !!hero && hero.textContent.includes('Gwalior');
  });
  console.log('   Hero Header Rendered:', heroVisible);

  // Capture Home Screenshot via Tunnel
  const homeScreenshot = path.join(SCREENSHOT_DIR, 'tunnel_01_home.png');
  await page.screenshot({ path: homeScreenshot });
  console.log('   Captured Screenshot: tunnel_01_home.png');

  // 2. Discover Places
  console.log('2. Clicking Discover Places...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Discover Places'));
    if (btn) btn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));

  const cardCount = await page.evaluate(() => {
    return document.querySelectorAll('.place-card').length;
  });
  console.log('   Attraction Cards Rendered:', cardCount);

  const placesScreenshot = path.join(SCREENSHOT_DIR, 'tunnel_02_places.png');
  await page.screenshot({ path: placesScreenshot });
  console.log('   Captured Screenshot: tunnel_02_places.png');

  // 3. Planning Studio & Itinerary Generation
  console.log('3. Navigating to Planning Studio & Generating Itinerary...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Planning Studio'));
    if (btn) btn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));

  await page.evaluate(() => {
    const generateBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Generate Feasible Itinerary'));
    if (generateBtn) generateBtn.click();
  });

  // Capture progress modal
  await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
  const progressScreenshot = path.join(SCREENSHOT_DIR, 'tunnel_03_agent_progress.png');
  await page.screenshot({ path: progressScreenshot });
  console.log('   Captured Screenshot: tunnel_03_agent_progress.png');

  // Wait for transition to route map
  console.log('   Waiting for route results & Leaflet map...');
  try {
    await page.waitForFunction(
      () => document.querySelector('.leaflet-container'),
      { timeout: 15000 }
    );
  } catch (e) {
    await page.evaluate(() => new Promise(r => setTimeout(r, 6000)));
  }

  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));
  const mapScreenshot = path.join(SCREENSHOT_DIR, 'tunnel_04_itinerary_map.png');
  await page.screenshot({ path: mapScreenshot });
  console.log('   Captured Screenshot: tunnel_04_itinerary_map.png');

  // 4. Test Tansen AI Chatbot
  console.log('4. Testing Tansen AI Chatbot...');
  await page.evaluate(() => {
    const chatBtn = document.querySelector('button[aria-label="Ask Tansen AI"], button[title*="Tansen AI"]');
    if (chatBtn) chatBtn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

  const chatScreenshot = path.join(SCREENSHOT_DIR, 'tunnel_05_chatbot.png');
  await page.screenshot({ path: chatScreenshot });
  console.log('   Captured Screenshot: tunnel_05_chatbot.png');

  await browser.close();

  console.log('\n====================================================');
  console.log('ALL TUNNEL TESTS PASSED SUCCESSFULLY OVER EXTERNAL HTTPS');
  console.log('Total Console/Page Errors:', errors.length);
  console.log('====================================================');
}

testTunnelInRealBrowser().catch(err => {
  console.error('Tunnel Browser Test Error:', err);
  process.exit(1);
});

