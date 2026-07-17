import { expect, test } from "@playwright/test";

test("loads core patient routes without horizontal overflow", async ({ page }) => {
  for (const path of ["/onboarding/welcome", "/patient/today", "/patient/care-plan", "/patient/life-map", "/patient/messages"]) {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  }
});
