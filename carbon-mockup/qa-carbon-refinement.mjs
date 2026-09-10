import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome'});
const errors=[], checks=[];
for (const width of [320,390,671,672,768,1056,1312,1584]) {
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 await context.route('https://api.github.com/**',route=>route.fulfill({json:[]}));
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 for(const path of ['/','/about.html','/gallery.html','/news.html','/changelog.html']) {
  await page.goto('http://127.0.0.1:4173'+path);
  await page.locator('#root header').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const selector of ['#header-theme-menu','#header-language-menu']) {
   const box=await page.locator(selector).boundingBox();
   expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x+box.width).toBeLessThanOrEqual(width);
  }
  if(path==='/about.html') {
   await expect(page.getByRole('list',{name:'Skills'}).getByRole('listitem')).toHaveCount(5);
   await expect(page.locator('.skills .cds--tag')).toHaveCount(0);
   const portrait=await page.locator('.portrait').boundingBox();
   const info=await page.locator('.about-body').boundingBox();
   expect(Math.abs(portrait.y-info.y)).toBeLessThan(1);
   expect(info.x).toBeGreaterThan(portrait.x+portrait.width);
   if(width<672) expect(portrait.width).toBe(96);
   if([320,390,672,1584].includes(width)) await page.screenshot({path:`qa/carbon-about-${width}.png`,fullPage:true});
  }
  if(width<672 && path==='/') {
   const primary=await page.locator('.hero-actions .cds--btn--primary').boundingBox();
   const secondary=await page.locator('.hero-actions .cds--btn--ghost').boundingBox();
   expect(primary.width).toBe(width-32); expect(primary.height).toBeGreaterThanOrEqual(48);
   expect(secondary.y).toBeGreaterThanOrEqual(primary.y+primary.height);
   await expect(page.locator('.recent-photos .photo-button:visible')).toHaveCount(3);
   if(width===390) await page.screenshot({path:'qa/carbon-home-390-full.png',fullPage:true});
  }
  if(path==='/gallery.html') {
   const cards=page.locator('.cds--tab-content:not([hidden]) .photo-button');
   const first=await cards.nth(0).boundingBox(), second=await cards.nth(1).boundingBox();
   if(width<672) {expect(first.width).toBe(width-32); expect(second.y).toBeGreaterThan(first.y+first.height);}
   else {
    expect(second.x).toBeGreaterThan(first.x);
    if(width<1056) expect((await cards.nth(2).boundingBox()).y).toBeGreaterThan(first.y);
   }
  }
  if(path==='/changelog.html') await expect(page.getByRole('link',{name:'Full history on GitHub'})).toBeVisible();
  if([320,672,1584].includes(width)) {
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   expect(audit.violations).toEqual([]);
  }
  checks.push(`${width} ${path}`);
 }
 await context.close();
}
// Longer translations must fit the same small-screen layout.
for (const language of ['pt','ja']) {
 const context=await browser.newContext({viewport:{width:320,height:900}});
 await context.addInitScript(language=>localStorage.setItem('lang',language),language);
 const page=await context.newPage();
 for(const path of ['/','/about.html','/gallery.html']) {
  await page.goto('http://127.0.0.1:4173'+path); await page.locator('#root header').waitFor();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('#header-language-menu').innerText()).toContain(language.toUpperCase());
  if(path==='/about.html') await page.screenshot({path:`qa/carbon-about-320-${language}.png`,fullPage:true});
 }
 await context.close();
}
await browser.close();
await fs.writeFile('qa/carbon-refinement-report.json',JSON.stringify({checks,errors},null,2));
expect(errors).toEqual([]);
console.log(`Carbon refinement: ${checks.length} page/viewport checks, mobile translations, list semantics, touch targets, and accessibility passed.`);
