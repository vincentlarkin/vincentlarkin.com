import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
const runs = [];
for (let run = 0; run < 3; run++) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();
  await context.route('https://api.github.com/**', route => route.fulfill({ json: [] }));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 80, downloadThroughput: 500000, uploadThroughput: 250000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    const check = () => {
      if (document.querySelector('#root header')) window.carbonVisibleAt = performance.now();
      else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.carbonVisibleAt);
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => ({
    firstPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    carbonVisible: window.carbonVisibleAt,
    resources: performance.getEntriesByType('resource').map(r => ({ name: new URL(r.name).pathname, bytes: r.decodedBodySize, start: r.startTime, end: r.responseEnd })),
  }));
  runs.push(result);
  await context.close();
}
await browser.close();
const median = key => runs.map(r => r[key]).sort((a,b) => a-b)[1];
const report = { median: { firstPaint: median('firstPaint'), carbonVisible: median('carbonVisible') }, runs };
await fs.writeFile(`qa/first-load-${process.env.REPORT || 'after'}.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.median));
