import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome' });
const base = 'http://127.0.0.1:4173';
for (const dark of [false, true]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  if (dark) await context.addInitScript(() => localStorage.setItem('vl-carbon-theme', 'g100'));
  const page = await context.newPage();
  let release;
  const gate = new Promise(resolve => release = resolve);
  const requests = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  await context.route('https://api.github.com/**', route => route.fulfill({ json: [] }));
  await context.route('**/assets/carbon/assets/*.js', async route => { await gate; await route.continue(); });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.startup-brand')).toBeVisible();
  await expect(page.locator('#page-content')).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe(dark ? 'rgb(22, 22, 22)' : 'rgb(255, 255, 255)');
  await page.screenshot({ path: `qa/startup-${dark ? 'dark' : 'light'}.png` });
  release();
  await page.locator('#root header').waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Component sizing depends on Carbon's shared layout tokens as well as
  // individual component styles; catch missing token imports visually.
  expect((await page.locator('.hero-actions .cds--btn--primary').boundingBox()).height).toBeGreaterThanOrEqual(48);
  await page.screenshot({ path: `qa/optimized-${dark ? 'dark' : 'light'}.png` });
  expect(requests.filter(url => url.startsWith('/css/') || ['/js/site.js', '/js/i18n.js', '/assets/carbon/manifest.json', '/images/pelican-carbon.png', '/images/archive-gold-crest.png'].includes(url))).toEqual([]);
  expect(requests.filter(url => url.includes('/thumbs/') || url.includes('/paintings/'))).toEqual([]);
  await context.close();
}
for (const extension of ['js', 'css']) {
  const context = await browser.newContext();
  await context.route(`**/assets/carbon/assets/*.${extension}`, route => route.abort());
  const page = await context.newPage();
  await page.goto(base);
  await expect(page.locator('#page-content')).toBeVisible();
  await page.waitForFunction(() => !!window.siteUtils);
  expect(await page.evaluate(() => window.carbonFailed)).toBe(true);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await context.close();
}
const noJS = await browser.newContext({ javaScriptEnabled: false });
const readable = await noJS.newPage();
await readable.goto(base + '/about.html');
await expect(readable.locator('main')).toBeVisible();
await expect(readable.getByRole('navigation', { name: 'Basic navigation' })).toBeVisible();
await noJS.close();
await browser.close();
console.log('Startup: visible light/dark identity, no legacy downloads, asset-failure recovery, and script-free reading passed.');
