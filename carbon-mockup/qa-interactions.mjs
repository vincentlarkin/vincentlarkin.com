import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const checks = [];
const base = "http://127.0.0.1:4173";
const audit = async (label) => {
  // Measure the settled dialog, not overlapping enter/exit animations.
  await page.waitForTimeout(750);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  checks.push({
    label,
    violations: result.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  });
};
await page.goto(`${base}/#/home`, { waitUntil: "networkidle" });
await page.keyboard.press("Tab");
await expect(
  page.getByRole("link", { name: "Skip to main content" }),
).toBeFocused();
await page.keyboard.press("Enter");
await expect(page.locator("main")).toBeFocused();
await expect(page.getByRole("heading", { level: 1 })).toHaveText(
  "VincentLarkin.",
);
await expect(page).toHaveURL(/#\/home$/);
checks.push({
  label: "Keyboard skip keeps current route and focuses main",
  passed: true,
});
await page.goto(`${base}/#/gallery`);
const photoTrigger = page.getByRole("button", {
  name: "View photograph: June–July 2026",
});
await photoTrigger.click();
await page.waitForTimeout(500);
await audit("Photo modal");
const dialog = page.getByRole("dialog");
for (let i = 0; i < 9; i++) {
  await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
}
await page.keyboard.press("Escape");
await expect(photoTrigger).toBeFocused();
checks.push({
  label: "Photo dialog traps and restores keyboard focus",
  passed: true,
});
await page.keyboard.press("Control+k");
await expect(page.getByRole("searchbox")).toBeFocused();
await audit("Search modal");
await page.getByRole("searchbox").fill("2025");
await page.getByRole("button", { name: "Photograph November 2025" }).click();
await expect(
  page.getByRole("heading", { name: "November 2025", exact: true }),
).toBeVisible();
await page.keyboard.press("Escape");
checks.push({
  label: "Keyboard search and photograph results work",
  passed: true,
});
await page.goto(`${base}/#/about`);
await page.getByRole("button", { name: "Copy email address" }).click();
expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
  "vincent@vincentlarkin.com",
);
await expect(page.getByRole("button", { name: "Email copied" })).toBeVisible();
checks.push({ label: "Copy email works with confirmation", passed: true });
await page.goto(`${base}/#/reading`);
const heading = page.getByRole("button", { name: "Business & Technology" });
await heading.click();
await expect(
  page.getByRole("link", { name: /T. Vincent Learson/ }),
).toBeVisible();
checks.push({ label: "Reading accordion expands articles", passed: true });
for (const width of [320, 768, 1024, 1584]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of ["home", "about", "gallery", "reading", "changelog"]) {
    await page.goto(`${base}/#/${route}`);
    await page.waitForTimeout(450);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  checks.push({ label: `All primary pages fit ${width}px`, passed: true });
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByRole("button", { name: "Switch to dark theme" }).click();
for (const route of [
  "home",
  "about",
  "gallery",
  "reading",
  "changelog",
  "privacy",
]) {
  await page.goto(`${base}/#/${route}`);
  await page.waitForTimeout(750);
  await audit(`Dark ${route}`);
  await page.screenshot({
    path: `qa/${route}-dark-verified.png`,
    fullPage: true,
  });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open navigation" }).click();
await page.waitForTimeout(500);
await audit("Open mobile navigation");
await page.keyboard.press("Escape");
await expect(
  page.getByRole("button", { name: "Open navigation" }),
).toBeVisible();
await page.getByRole("button", { name: "Switch to light theme" }).click();
for (const route of ["home", "about", "gallery", "reading", "changelog"]) {
  await page.goto(`${base}/#/${route}`);
  await page.waitForTimeout(500);
  await audit(`Mobile ${route}`);
}
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(`${base}/#/home`);
expect(
  await page
    .locator("main")
    .evaluate((el) => parseFloat(getComputedStyle(el).animationDuration)),
).toBeLessThan(0.001);
checks.push({ label: "Reduced motion respected", passed: true });
await fs.writeFile("qa/interactions.json", JSON.stringify(checks, null, 2));
console.log(JSON.stringify(checks, null, 2));
await browser.close();
if (checks.some((check) => check.violations?.length)) process.exitCode = 1;
