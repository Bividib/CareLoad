import { expect, test } from "@playwright/test";

test("loads core patient routes without horizontal overflow", async ({ page }) => {
  await page.request.post("/api/demo/reset", { data: { confirmSyntheticReset: true } });
  for (const path of ["/onboarding/welcome", "/patient/today", "/patient/care-plan", "/patient/life-map", "/patient/messages"]) {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  }
});

test("persists a Life Map edit and creates a reviewable proposed plan", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.request.post("/api/demo/reset", { data: { confirmSyntheticReset: true } });
  await page.goto("/patient/life-map");
  await expect(page.getByRole("button", { name: "Save my Life Map" })).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("School run start").fill("07:20");
  const saved = page.waitForResponse((response) => response.url().endsWith("/api/life-map") && response.request().method() === "PUT");
  await page.getByRole("button", { name: "Save my Life Map" }).click();
  expect(pageErrors).toEqual([]);
  expect((await saved).status()).toBe(200);
  await expect(page.getByRole("status")).toContainText("active plan is unchanged", { timeout: 10_000 });
  await page.reload();
  await expect(page.getByLabel("School run start")).toHaveValue("07:20");
  await page.goto("/patient/updates/demo-update/preview");
  await page.getByRole("button", { name: "Accept proposed plan" }).click();
  await expect(page).toHaveURL(/\/patient\/today$/);
});
