const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BENCHMARK_DIR = path.join(__dirname, '..', 'MD', 'benchmark_screenshots');

const TARGETS = [
  { url: 'https://www.australia.com/', category: 'Tourism & Travel', name: 'Australia.com' },
  { url: 'https://www.visiticeland.com/', category: 'Tourism & Travel', name: 'Visit Iceland' },
  { url: 'https://www.japan.travel/en/', category: 'Tourism & Travel', name: 'Japan Travel' },
  { url: 'https://www.incredibleindia.gov.in/', category: 'Tourism & Travel', name: 'Incredible India' },
  { url: 'https://locomotive.ca/', category: 'Creative & Animation', name: 'Locomotive' },
  { url: 'https://activetheory.net/', category: 'Creative & WebGL', name: 'Active Theory' },
  { url: 'https://www.aesop.com/', category: 'Editorial & Luxury', name: 'Aesop' },
  { url: 'https://linear.app/', category: 'Premium Product', name: 'Linear' },
  { url: 'https://stripe.com/', category: 'Premium Product', name: 'Stripe' }
];

async function runBenchmark() {
  if (!fs.existsSync(BENCHMARK_DIR)) {
    fs.mkdirSync(BENCHMARK_DIR, { recursive: true });
  }

  console.log('Launching Chrome for International Benchmarking Inspection...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars']
  });

  const results = [];

  for (const t of TARGETS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    console.log(`\nInspecting: ${t.name} (${t.url})...`);
    
    try {
      const response = await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      const status = response ? response.status() : 'Unknown';
      await page.evaluate(() => new Promise(r => setTimeout(r, 2000)));

      // Inspect metadata, typography, and layout structure
      const metadata = await page.evaluate(() => {
        const title = document.title || '';
        const h1 = document.querySelector('h1')?.innerText?.trim() || '';
        const bodyFont = window.getComputedStyle(document.body).fontFamily || '';
        const h1Font = document.querySelector('h1') ? window.getComputedStyle(document.querySelector('h1')).fontFamily : '';
        const bg = window.getComputedStyle(document.body).backgroundColor || '';
        const color = window.getComputedStyle(document.body).color || '';
        const navLinksCount = document.querySelectorAll('nav a, header a').length;
        const imagesCount = document.querySelectorAll('img').length;
        const hasCanvas = !!document.querySelector('canvas');
        const hasVideo = !!document.querySelector('video');

        return {
          title,
          h1: h1.slice(0, 100),
          bodyFont: bodyFont.slice(0, 60),
          h1Font: h1Font.slice(0, 60),
          bg,
          color,
          navLinksCount,
          imagesCount,
          hasCanvas,
          hasVideo
        };
      });

      const shotFile = path.join(BENCHMARK_DIR, `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`);
      await page.screenshot({ path: shotFile });

      results.push({
        ...t,
        status,
        inspectedAt: new Date().toISOString(),
        screenshot: shotFile,
        metadata
      });

      console.log(`  ✓ Success (${status}): ${metadata.title.slice(0, 50)}`);
      console.log(`    Heading: ${metadata.h1}`);
      console.log(`    Typography: ${metadata.h1Font} | ${metadata.bodyFont}`);
      console.log(`    Canvas: ${metadata.hasCanvas} | Video: ${metadata.hasVideo} | Images: ${metadata.imagesCount}`);
    } catch (err) {
      console.warn(`  ✗ Failed to inspect ${t.name}:`, err.message);
      results.push({
        ...t,
        status: 'FAILED',
        error: err.message,
        inspectedAt: new Date().toISOString()
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, '..', 'MD', 'benchmark_data.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nBenchmarking data saved to MD/benchmark_data.json');
}

runBenchmark().catch(err => {
  console.error('Benchmarking runner fatal error:', err);
});

