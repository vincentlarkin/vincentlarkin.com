import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

await fs.mkdir("qa", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
for (const width of [1440, 1024, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of ["home", "about", "gallery", "reading", "changelog"]) {
    await page.goto(`http://127.0.0.1:4173/#/${route}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(450);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const header = await page.locator(".cds--header").boundingBox();
    expect(header.height).toBe(56);
    const logo = page.locator(".brand-emblem");
    expect(
      await logo.evaluate((el) => el.complete && el.naturalWidth > 0),
    ).toBe(true);
    if (route === "about") {
      const portrait = await page.locator(".portrait img").boundingBox();
      expect(portrait.width).toBeLessThanOrEqual(160);
    }
    if (width === 1440 || width === 390) {
      await page.screenshot({
        path: `qa/refined-${route}-${width}.png`,
        fullPage: true,
      });
      const report = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      results.push({
        route,
        width,
        violations: report.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      });
    }
  }
  results.push({ width, layout: "pass" });
}
await page.setViewportSize({ width: 320, height: 844 });
await page.getByRole("button", { name: "Open navigation" }).click();
await expect(
  page.getByRole("navigation", { name: "Mobile navigation" }),
).toBeVisible();
await page
  .getByRole("navigation", { name: "Mobile navigation" })
  .getByRole("link", { name: "Gallery", exact: true })
  .click();
await expect(
  page.getByRole("heading", { name: "Gallery", exact: true }),
).toBeVisible();
await page.getByRole("button", { name: "Switch to dark theme" }).click();
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://127.0.0.1:4173/#/home");
await page.waitForTimeout(750);
await page.screenshot({ path: "qa/refined-home-dark.png", fullPage: true });
const dark = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  .analyze();
results.push({
  route: "home-dark",
  violations: dark.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => n.target),
  })),
});
await fs.writeFile(
  "qa/refinements.json",
  JSON.stringify({ errors, results }, null, 2),
);
console.log(JSON.stringify({ errors, results }, null, 2));
await browser.close();
if (errors.length || results.some((r) => r.violations?.length))
  process.exitCode = 1;
