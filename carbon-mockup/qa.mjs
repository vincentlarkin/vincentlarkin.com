import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

await fs.mkdir("qa", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/home-desktop.png", fullPage: true });
const report = [];
for (const route of [
  "home",
  "about",
  "gallery",
  "reading",
  "changelog",
  "privacy",
]) {
  await page.goto(`http://127.0.0.1:4173/#/${route}`);
  await page.waitForTimeout(500);
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const brokenImages = await page
    .locator("img")
    .evaluateAll((images) =>
      images.filter((i) => i.complete && !i.naturalWidth).map((i) => i.src),
    );
  report.push({
    route,
    brokenImages,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    violations: a11y.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
await page.goto("http://127.0.0.1:4173/#/gallery");
await page.getByRole("tab", { name: "2025" }).click();
if (
  (await page
    .getByRole("tabpanel")
    .getByRole("button", { name: "View photograph:" })
    .count()) !== 4
)
  throw new Error("Year filter failed");
await page
  .getByRole("button", { name: "View photograph: November 2025" })
  .click();
await page.getByRole("button", { name: "Next", exact: true }).click();
await page
  .getByRole("heading", { name: "October 2025", exact: true })
  .waitFor();
await page.keyboard.press("ArrowLeft");
await page
  .getByRole("heading", { name: "November 2025", exact: true })
  .waitFor();
await page.keyboard.press("Escape");
await page
  .getByRole("button", { name: "Search the site", exact: true })
  .click();
await page.getByRole("searchbox").fill("medical");
await page.getByRole("link", { name: /Rethinking/ }).waitFor();
await page.getByRole("searchbox").fill("no-match-123456");
await page.getByText("No matches for").waitFor();
await page.keyboard.press("Escape");
await page.goto("http://127.0.0.1:4173/#/home");
await page.getByRole("button", { name: "Switch to dark theme" }).click();
await page.waitForTimeout(750);
await page.screenshot({ path: "qa/home-dark.png", fullPage: true });
const dark = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  .analyze();
report.push({
  route: "home-dark",
  violations: dark.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => ({
      target: n.target,
      summary: n.failureSummary,
    })),
  })),
});
await page.reload();
if ((await page.locator("html").getAttribute("data-carbon-theme")) !== "g100")
  throw new Error("Theme persistence failed");
await page.getByRole("button", { name: "Switch to light theme" }).click();
await page.waitForTimeout(750);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "qa/home-mobile.png", fullPage: true });
await page.getByRole("button", { name: "Open navigation" }).click();
await page
  .getByRole("navigation", { name: "Mobile navigation" })
  .getByRole("link", { name: "Gallery", exact: true })
  .click();
await page.getByRole("heading", { name: "Gallery", exact: true }).waitFor();
for (const route of [
  "home",
  "about",
  "gallery",
  "reading",
  "changelog",
  "privacy",
]) {
  await page.goto(`http://127.0.0.1:4173/#/${route}`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `qa/${route}-mobile.png`, fullPage: true });
  report.push({
    route: `${route}-mobile`,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
}
await fs.writeFile(
  "qa/report.json",
  JSON.stringify({ errors, report }, null, 2),
);
console.log(JSON.stringify({ errors, report }, null, 2));
await browser.close();
