import { chromium } from 'playwright';
import { mkdirSync, renameSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const artifactsDir = '/opt/cursor/artifacts';
const outputVideo = join(artifactsDir, 'gbp-currency-demo.webm');

mkdirSync(artifactsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  recordVideo: {
    dir: artifactsDir,
    size: { width: 1280, height: 720 },
  },
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage();

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForSelector('.currency-toggle');

const loanInput = page.locator('#originalLoanAmount');
const heroValue = page.locator('.hero-value').first();

async function assertContainsCurrency(currency) {
  await page.waitForFunction(
    ({ selector, currencyCode }) => {
      const element = document.querySelector(selector);
      return element && element.textContent.includes(currencyCode);
    },
    { selector: '.hero-value', currencyCode: currency },
    { timeout: 5000 }
  );
}

await page.getByRole('button', { name: 'SEK', exact: true }).click();
await page.waitForTimeout(400);
const sekLoan = await loanInput.inputValue();
if (sekLoan !== '2000000') {
  throw new Error(`Expected SEK loan amount 2000000, got ${sekLoan}`);
}

await page.getByRole('button', { name: 'EUR', exact: true }).click();
await page.waitForTimeout(600);
await assertContainsCurrency('EUR');
const eurLoan = Number(await loanInput.inputValue());
if (Math.abs(eurLoan - Math.round(2_000_000 / 11.5)) > 1) {
  throw new Error(`Unexpected EUR loan conversion: ${eurLoan}`);
}

await page.getByRole('button', { name: 'GBP', exact: true }).click();
await page.waitForTimeout(600);
await assertContainsCurrency('GBP');
const gbpLoan = Number(await loanInput.inputValue());
if (Math.abs(gbpLoan - Math.round(2_000_000 / 13.2)) > 1) {
  throw new Error(`Unexpected GBP loan conversion: ${gbpLoan}`);
}

await page.getByRole('button', { name: 'Payment Strategies' }).click();
await page.waitForTimeout(400);
await page.getByText('+76 GBP/month').waitFor({ timeout: 5000 });

await page.getByRole('button', { name: 'Amortization Chart' }).click();
await page.waitForTimeout(800);
await page.getByRole('button', { name: 'GBP', exact: true }).click();
await page.waitForTimeout(800);

await page.getByRole('button', { name: 'SEK', exact: true }).click();
await page.waitForTimeout(500);
await assertContainsCurrency('SEK');

await page.waitForTimeout(1000);

const video = page.video();
await context.close();
await browser.close();

if (!video) {
  throw new Error('Playwright did not record a video');
}

const recordedPath = await video.path();
renameSync(recordedPath, outputVideo);

console.log(`Browser demo passed. Video saved to ${outputVideo}`);
