const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'MD', 'screenshots');

async function testMap() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 20000 });

  // Navigate to Planning Studio
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const planBtn = buttons.find(b => b.textContent.includes('Planning Studio'));
    if (planBtn) planBtn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

  // Generate Itinerary
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent.includes('Generate Feasible Itinerary')
    );
    if (submitBtn) submitBtn.click();
  });

  // Wait for results & map tiles to load
  await page.evaluate(() => new Promise(r => setTimeout(r, 3500)));

  const file = path.join(SCREENSHOT_DIR, '07_itinerary_results_and_map_1920x1080.png');
  await page.screenshot({ path: file });
  console.log('✓ Captured updated itinerary and map screenshot:', file);

  await browser.close();
}

testMap().catch(console.error);

