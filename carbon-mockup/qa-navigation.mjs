import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
for (const mode of ['native', 'fallback', 'reduced', 'mobile']) {
  const context = await browser.newContext({
    viewport: { width: mode === 'mobile' ? 390 : 1440, height: 950 },
    reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
  });
  await context.route('https://api.github.com/**', route => route.fulfill({ json: [] }));
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  let documents = 0;
  page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; });
  await page.addInitScript(mode => {
    window.transitions = 0;
    if (mode === 'fallback') document.startViewTransition = undefined;
    else if (document.startViewTransition) {
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = callback => {
        window.transitions++;
        const transition = start(callback);
        window.transitionFinished = transition.finished;
        return transition;
      };
    }
  }, mode);
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#root .brand-lockup').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('#root img[loading="eager"]')].map(img => img.decode().catch(() => {})));
  });
  await page.evaluate(() => { window.headerIdentity = document.querySelector('#root header'); window.holidayIdentity = document.querySelector('.holiday-strip'); });
  const tab = async (label, path) => {
    const changed = new URL(page.url()).pathname !== path;
    if (mode === 'mobile') {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await page.locator('#root .cds--side-nav').getByRole('link', { name: label, exact: true }).click();
    } else {
      await page.locator('#root header .cds--header__nav').getByRole('link', { name: label, exact: true }).click();
    }
    await expect(page).toHaveURL(`http://127.0.0.1:4173${path}`);
    await page.evaluate(() => window.transitionFinished);
    if (changed) await expect(page.locator('#root main')).toBeFocused();
    expect(await page.evaluate(() => window.headerIdentity === document.querySelector('#root header') && window.holidayIdentity === document.querySelector('.holiday-strip'))).toBe(true);
  };
  await page.evaluate(() => window.scrollTo(0, 650));
  await page.waitForTimeout(100);
  await tab('About', '/about.html');
  await expect(page).toHaveTitle('About — vincentlarkin.com');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await tab('Gallery', '/gallery.html');
  await expect(page.locator('#root .photo-button').first()).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/about.html$/);
  await page.evaluate(() => window.transitionFinished);
  await expect(page).toHaveTitle('About — vincentlarkin.com');
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
  await page.goForward();
  await expect(page).toHaveURL(/about.html$/);
  await tab('News / Books', '/news.html');
  await tab('Changelog', '/changelog.html');
  await tab('Home', '/');
  // A repeat click does not create another history entry or animation.
  const count = await page.evaluate(() => [history.length, window.transitions]);
  await tab('Home', '/');
  expect(await page.evaluate(() => [history.length, window.transitions])).toEqual(count);
  // Quick successive choices must land on the last destination.
  await page.evaluate(() => {
    for (const path of ['/about.html', '/gallery.html', '/news.html'])
      document.querySelector(`#root header a[href="${path}"]`).click();
  });
  await expect(page).toHaveURL(/news.html$/);
  await expect(page).toHaveTitle('News / Books — vincentlarkin.com');
  await page.evaluate(() => window.transitionFinished);
  expect(documents).toBe(1);
  if (mode === 'reduced' || mode === 'fallback') expect(await page.evaluate(() => window.transitions)).toBe(0);
  else expect(await page.evaluate(() => window.transitions)).toBeGreaterThan(0);
  if (mode === 'native') {
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations).toEqual([]);
    // Refresh and a direct document entry still work with the static host.
    await page.reload();
    await page.locator('#root .brand-lockup').waitFor();
    await expect(page).toHaveTitle('News / Books — vincentlarkin.com');
    await page.goto('http://127.0.0.1:4173/articles/learson-dies.html');
    await page.locator('#root .document-page').waitFor();
    await page.evaluate(() => { window.headerIdentity = document.querySelector('#root header'); window.holidayIdentity = document.querySelector('.holiday-strip'); });
    const article = await page.locator('#root main').innerText();
    await tab('About', '/about.html');
    await page.goBack();
    await expect(page.locator('#root main')).toHaveText(article);
  }
  console.log(`${mode}: no reloads, persistent header, history, scroll, focus, and rapid navigation passed`);
  await context.close();
}
await browser.close();
expect(errors).toEqual([]);
