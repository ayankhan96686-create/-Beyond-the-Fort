const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'MD', 'screenshots');

const VIEWPORTS = [
  { name: 'desktop_1920x1080', width: 1920, height: 1080 },
  { name: 'desktop_1440x900', width: 1440, height: 900 },
  { name: 'laptop_1366x768', width: 1366, height: 768 },
  { name: 'tablet_landscape_1024x768', width: 1024, height: 768 },
  { name: 'tablet_portrait_768x1024', width: 768, height: 1024 },
  { name: 'mobile_430x932', width: 430, height: 932, isMobile: true, hasTouch: true },
  { name: 'mobile_390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'mobile_360x800', width: 360, height: 800, isMobile: true, hasTouch: true }
];

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Launching Chrome via Puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars']
  });

  const page = await browser.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('Testing Home Route at 1920x1080...');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

  const heroScreenshot = path.join(OUTPUT_DIR, '01_home_hero_1920x1080.png');
  await page.screenshot({ path: heroScreenshot, fullPage: false });
  console.log('Saved:', heroScreenshot);

  await browser.close();
  console.log('Test completed successfully. Console errors count:', consoleErrors.length);
}

run().catch(err => {
  console.error('Puppeteer runner error:', err);
  process.exit(1);
});

