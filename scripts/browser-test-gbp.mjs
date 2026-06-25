/**
 * Browser verification for GBP currency toggle.
 * Run: node scripts/browser-test-gbp.mjs
 * Requires dev server at http://localhost:5173 (started automatically if not running).
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const ARTIFACTS_DIR = '/opt/cursor/artifacts/gbp-currency-test';

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not ready at ${url}`);
}

async function ensureDevServer() {
  try {
    await waitForServer(BASE_URL, 2000);
    console.log('Dev server already running');
    return null;
  } catch {
    console.log('Starting dev server...');
    const proc = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
      cwd: '/workspace',
      stdio: 'pipe',
      detached: false,
    });
    await waitForServer(BASE_URL);
    return proc;
  }
}

async function run() {
  await mkdir(ARTIFACTS_DIR, { recursive: true });

  const devServer = await ensureDevServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: ARTIFACTS_DIR, size: { width: 1280, height: 800 } },
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const results = [];

  try {
    await page.goto(BASE_URL);
    await page.waitForSelector('.currency-toggle');

    // Verify all three currency buttons exist
    for (const code of ['SEK', 'EUR', 'GBP']) {
      const btn = page.locator('.currency-toggle button', { hasText: code });
      await btn.waitFor({ state: 'visible' });
      results.push(`✓ ${code} toggle button visible`);
    }

    // Capture SEK baseline
    await page.locator('.currency-toggle button', { hasText: 'SEK' }).click();
    await page.waitForTimeout(300);
    const sekLoan = await page.locator('#currentLoanAmount').inputValue();
    results.push(`✓ SEK loan amount: ${sekLoan}`);

    // Switch to GBP and verify conversion
    await page.locator('.currency-toggle button', { hasText: 'GBP' }).click();
    await page.waitForTimeout(300);
    const gbpLoan = Number(await page.locator('#currentLoanAmount').inputValue());
    const expectedGbp = Math.round(Number(sekLoan) / 13.2);
    results.push(`✓ GBP loan amount: ${gbpLoan} (expected ~${expectedGbp})`);

    if (Math.abs(gbpLoan - expectedGbp) > 1) {
      throw new Error(`GBP conversion mismatch: got ${gbpLoan}, expected ${expectedGbp}`);
    }

    // Verify GBP formatting in results panel
    const heroValue = await page.locator('.hero-value').textContent();
    if (!heroValue.includes('GBP')) {
      throw new Error(`Results not showing GBP: ${heroValue}`);
    }
    results.push(`✓ Results display in GBP: ${heroValue.trim()}`);

    // Verify GBP label on loan inputs
    const gbpLabel = await page.locator('label[for="currentLoanAmount"]').textContent();
    if (!gbpLabel.includes('GBP')) {
      throw new Error(`Input label missing GBP: ${gbpLabel}`);
    }
    results.push(`✓ Input labels show GBP`);

    // Switch EUR -> GBP and back to SEK round-trip
    await page.locator('.currency-toggle button', { hasText: 'EUR' }).click();
    await page.waitForTimeout(300);
    const eurLoan = await page.locator('#currentLoanAmount').inputValue();
    results.push(`✓ EUR loan amount: ${eurLoan}`);

    await page.locator('.currency-toggle button', { hasText: 'SEK' }).click();
    await page.waitForTimeout(300);
    const sekRoundTrip = Number(await page.locator('#currentLoanAmount').inputValue());
    if (Math.abs(sekRoundTrip - Number(sekLoan)) > 100) {
      throw new Error(`Round-trip SEK mismatch: ${sekRoundTrip} vs ${sekLoan}`);
    }
    results.push(`✓ Round-trip back to SEK: ${sekRoundTrip}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gbp-toggle-screenshot.png'), fullPage: true });
    results.push('✓ Screenshot saved');

    console.log('\nBrowser test results:');
    results.forEach((r) => console.log(r));
    console.log('\nAll browser tests passed.');
  } finally {
    await context.close();
    await browser.close();
    if (devServer) devServer.kill();
  }
}

run().catch((err) => {
  console.error('Browser test failed:', err.message);
  process.exit(1);
});
