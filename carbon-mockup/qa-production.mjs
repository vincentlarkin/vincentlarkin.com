import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [], checks = [], violations = [], events = [];
page.on('pageerror', e => errors.push(e.message));
await page.exposeFunction('recordEvent', entry => events.push(entry));
await page.addInitScript(() => {
  window.dataLayer = [];
  const push = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = entry => { window.recordEvent(Array.from(entry)); return push(entry); };
});
await context.route('https://api.github.com/**', route => route.fulfill({ json: [{ sha: '1234567' + 'a'.repeat(33), commit: { message: 'Production integration check', author: { date: '2026-09-04T12:00:00Z' } } }] }));
const base = 'http://127.0.0.1:4173';
const open = async route => { await page.goto(base + route); await page.locator('#root .brand-lockup').waitFor(); await page.waitForTimeout(750); };
for (const width of (process.env.SKIP_LAYOUT ? [] : [1440, 390, 320])) {
  await page.setViewportSize({ width, height: 950 });
  for (const route of ['/', '/about.html', '/gallery.html', '/news.html', '/changelog.html', '/privacy.html', '/articles/learson-dies.html']) {
    await open(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await expect(page.locator('#root h1')).toHaveCount(1);
    expect(await page.evaluate(() => window.siteAnalytics.enabled)).toBe(false);
    if (width !== 320) {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      violations.push(...result.violations.map(v => ({ width, route, id:v.id, nodes:v.nodes.map(n=>n.target) })));
    }
    checks.push(`${width}: ${route}`);
  }
}
console.log(JSON.stringify({ layoutChecks:checks.length, violations }));
await page.setViewportSize({ width:1440,height:1000 });
await open('/');
await expect(page.locator('.change-row').first()).toContainText('Production integration check');
await expect(page.locator('.louisiana-art img')).toHaveAttribute('src','/images/louisiana911-icon-192.png');
await expect(page.locator('.archive-image img')).toHaveAttribute('src','/images/archive-gold-crest-card.webp');
await page.screenshot({path:'qa/production-home.png',fullPage:true});
await page.getByRole('button',{name:'Switch to dark theme',exact:true}).click();
await expect(page.locator('.app-theme')).toHaveClass(/cds--g100/);
await page.reload(); await page.locator('.brand-lockup').waitFor();
expect(await page.evaluate(()=>window.sitePreferences.analyticsTheme())).toBe('carbon-dark');
await page.waitForTimeout(750);
const darkAudit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
violations.push(...darkAudit.violations.map(v=>({route:'dark home',id:v.id})));
await page.screenshot({path:'qa/production-dark.png',fullPage:true});
await page.getByRole('button',{name:'Theme',exact:true}).click();
await page.getByRole('menuitem',{name:'Retro',exact:true}).click();
await page.waitForFunction(()=>document.body.classList.contains('theme-retro') && !!window.siteUtils);
await page.locator('#theme-select .cs-trigger').click();
await page.locator('#theme-select [data-value="theme-vin"]').click();
await expect(page.locator('body')).toHaveClass(/theme-vin/);
await page.locator('#theme-select .cs-trigger').click();
await page.locator('#theme-select [data-value="theme-light"]').click();
await page.locator('#header-theme-menu').waitFor();
expect(await page.evaluate(()=>window.sitePreferences.analyticsTheme())).toBe('carbon-dark');
await page.locator('#header-language-menu').click();
await page.getByRole('menuitem',{name:/Português/}).click();
await page.waitForFunction(()=>document.documentElement.lang==='pt' && document.querySelector('#root header')?.textContent.includes('Início'));
await page.locator('#header-language-menu').click();
await page.getByRole('menuitem',{name:/日本語/}).click();
await page.waitForFunction(()=>document.documentElement.lang==='ja' && document.querySelector('#root header')?.textContent.includes('ホーム'));
await page.locator('#header-language-menu').click();
await page.getByRole('menuitem',{name:/English/}).click();
await page.waitForFunction(()=>document.documentElement.lang==='en' && !!document.querySelector('#root header'));
await open('/gallery.html');
await page.getByRole('tab',{name:/2025/}).click();
await expect(page.locator('.cds--tab-content:not([hidden]) .photo-button')).toHaveCount(4);
await page.locator('.cds--tab-content:not([hidden]) .photo-button').first().click();
await expect(page.getByRole('dialog',{name:'The monthly collection',exact:true})).toBeVisible();
await page.waitForTimeout(750);
const modalAudit = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
violations.push(...modalAudit.violations.map(v=>({route:'photo modal',id:v.id})));
for (let i=0;i<10;i++) {
  await page.keyboard.press('Tab');
  expect(await page.evaluate(()=>!!document.activeElement.closest('[role="dialog"]'))).toBeTruthy();
}
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog',{name:'The monthly collection',exact:true})).toBeHidden();
await expect(page.locator('.cds--tab-content:not([hidden]) .photo-button').first()).toBeFocused();
const changes=events.filter(e=>e[0]==='event'&&e[1]==='theme_change').map(e=>e[2]);
expect(changes.map(e=>[e.previous_theme,e.theme_name])).toEqual([
 ['carbon-light','carbon-dark'],['carbon-dark','retro'],['retro','vin'],['vin','carbon-dark']
]);
expect(events.some(e=>e[1]==='theme_view'&&e[2].site_theme==='carbon-dark')).toBeTruthy();
expect(events.some(e=>e[1]==='gallery_image_open')).toBeTruthy();
expect(events.filter(e=>e[1]==='language_change').map(e=>e[2].language_code)).toEqual(['pt','ja','en']);
await context.close();
// Run the actual Google tag against a local copy under its production origin.
// Capture and fulfill collection requests locally; no QA visits reach Analytics.
const production=await browser.newContext();
const hits=[];
await production.route('https://vincentlarkin.com/**',async route=>{
 const target=new URL(route.request().url()).pathname;
 const file=path.resolve('..','.'+(target==='/'?'/index.html':decodeURIComponent(target)));
 await route.fulfill({path:file});
});
await production.route(/https:\/\/[^/]*google-analytics\.com\//,async route=>{
 hits.push(route.request().url() + '&' + (route.request().postData() || ''));
 await route.fulfill({status:204});
});
const live=await production.newPage();
await live.goto('https://vincentlarkin.com/');
await live.locator('.brand-lockup').waitFor();
await live.getByRole('button',{name:'Switch to dark theme',exact:true}).click();
await expect.poll(()=>hits.some(hit=>hit.includes('en=theme_change')), {timeout:20000}).toBeTruthy();
await fs.writeFile('qa/google-requests.json',JSON.stringify(hits,null,2));
expect(hits.some(hit=>hit.includes('tid=G-9D6Q6F0NB5')&&hit.includes('en=page_view')&&hit.includes('ep.site_theme=carbon-light'))).toBeTruthy();
expect(hits.some(hit=>hit.includes('en=theme_change')&&hit.includes('ep.theme_name=carbon-dark')&&hit.includes('ep.previous_theme=carbon-light'))).toBeTruthy();
expect(hits.join('&').match(/en=page_view/g)).toHaveLength(1);
await live.locator('header .cds--header__nav').getByRole('link',{name:'About',exact:true}).click();
await expect(live).toHaveURL('https://vincentlarkin.com/about.html');
await expect.poll(()=>hits.join('&').match(/en=page_view/g)?.length, {timeout:20000}).toBe(2);
await live.locator('header .cds--header__nav').getByRole('link',{name:'Gallery',exact:true}).click();
await expect(live).toHaveURL('https://vincentlarkin.com/gallery.html');
await expect.poll(()=>hits.join('&').match(/en=page_view/g)?.length, {timeout:20000}).toBe(3);
await fs.writeFile('qa/google-requests.json',JSON.stringify(hits,null,2));
await production.close();
await fs.writeFile('qa/production-report.json',JSON.stringify({checks,errors,violations,themeChanges:changes,googleCollectionRequests:hits.length},null,2));
await browser.close();
expect(errors).toEqual([]);
expect(violations).toEqual([]);
console.log(JSON.stringify({checks:checks.length, errors, violations, googleCollectionRequests:hits.length}));
