import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const errors=[], violations=[];
for(const width of [1440,1024,768,600,481,390,320]) {
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-09-07T12:00:00'));
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#header-language-menu').waitFor();
  for(const id of ['header-theme-menu','header-language-menu']) {
    const box=await page.locator('#'+id).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x+box.width).toBeLessThanOrEqual(width);
    expect(box.y+box.height).toBeLessThanOrEqual(56);
  }
  for(const mode of ['light','dark']) {
    await page.locator('#header-theme-menu').click();
    await expect(page.getByRole('menuitem')).toHaveCount(3);
    await expect(page.getByRole('menuitem',{name:'Carbon Selected',exact:true})).toBeVisible();
    await checkMenu(page,width,'theme-'+mode);
    await page.getByRole('menuitem',{name:/^Carbon/}).click();
    await expect(page.locator('.app-theme')).toHaveClass(mode==='light'?/cds--white/:/cds--g100/);
    await page.locator('.header-mode-toggle').click();
    await expect(page.locator('.app-theme')).toHaveClass(mode==='light'?/cds--g100/:/cds--white/);
    await page.locator('#header-language-menu').click();
    await expect(page.getByRole('menuitem')).toHaveCount(3);
    await checkMenu(page,width,'language-'+mode);
    await page.keyboard.press('Escape');
    await expect(page.locator('#header-language-menu')).toBeFocused();
  }
  await page.locator('#header-theme-menu').click();
  await page.locator('#header-language-menu').click();
  await expect(page.getByRole('menuitem')).toHaveCount(3);
  await page.getByRole('menuitem',{name:/Português/}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','pt');
  await expect(page.locator('#header-language-menu')).toContainText('PT');
  await page.locator('#header-language-menu').click();
  await page.getByRole('menuitem',{name:/日本語/}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','ja');
  await expect(page.locator('#header-language-menu')).toContainText('JA');
  await page.reload(); await page.locator('#header-language-menu').waitFor();
  await expect(page.locator('#header-language-menu')).toContainText('JA');
  await page.locator('#header-language-menu').click();
  await page.getByRole('menuitem',{name:/English/}).click();
  await expect(page.locator('#header-language-menu')).toContainText('EN');
  if(width<=600) {
    await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('link',{name:'Search the site',exact:true}).click();
    await expect(page.getByRole('dialog',{name:'Vincent Larkin',exact:true})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Open navigation',exact:true})).toBeFocused();
  }
  await page.clock.setFixedTime(new Date('2026-09-08T12:00:00'));
  await page.reload(); await page.locator('#header-language-menu').waitFor();
  await expect(page.locator('.holiday-strip')).toHaveCount(0);
  await page.locator('#header-language-menu').click();
  expect((await page.getByRole('menuitem').first().boundingBox()).y).toBeGreaterThanOrEqual(56);
  await context.close();
}
async function checkMenu(page,width,label) {
  const banner=await page.locator('.holiday-strip').boundingBox();
  for(const item of await page.getByRole('menuitem').all()) {
    const box=await item.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(banner.y+banner.height);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x+box.width).toBeLessThanOrEqual(width);
    expect(await item.evaluate(e=>{
      const r=e.getBoundingClientRect();
      return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
    })).toBeTruthy();
  }
  const menu=page.locator('.header-preference-options');
  expect(await menu.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(38, 38, 38)');
  await page.waitForTimeout(500);
  if(width===1440||width===320) {
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    violations.push(...audit.violations.map(v=>({width,label,id:v.id,nodes:v.nodes.map(n=>n.target)})));
    await page.screenshot({path:`qa/header-${label}-${width}.png`});
  }
}
await browser.close();
await fs.writeFile('qa/header-menu-report.json',JSON.stringify({errors,violations},null,2));
expect(errors).toEqual([]); expect(violations).toEqual([]);
console.log('Header menus: placement, colors, all rows unobscured, mobile fit, language persistence, keyboard focus, and accessibility passed.');
