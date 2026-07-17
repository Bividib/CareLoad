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

test("completes functional onboarding with deterministic document extraction", async ({ page }) => {
  test.setTimeout(120_000);
  await page.request.post("/api/demo/reset", { data: { confirmSyntheticReset: true } });
  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding\/welcome$/);
  await page.getByLabel(/supports planning/i).check();
  await page.getByLabel(/synthetic data only/i).check();
  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page).toHaveURL(/\/onboarding\/build$/);
  await page.getByRole("button", { name: /Upload documents/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Use all three sample documents" }).click();
  await expect(page.getByText("cardiology-discharge-summary.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Process documents" }).click();
  await expect(page).toHaveURL(/\/onboarding\/processing$/);
  await page.getByRole("button", { name: "Start extraction" }).click();
  await expect(page).toHaveURL(/\/onboarding\/review$/, { timeout: 20_000 });
  await page.getByRole("button", { name: "Confirm all current tasks" }).click();
  await page.getByRole("button", { name: "Continue to Life Map" }).click();
  await expect(page).toHaveURL(/\/onboarding\/life-map$/);
  await expect(page.getByRole("button", { name: "Save my Life Map" })).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name: "Save my Life Map" }).click();
  await expect(page).toHaveURL(/\/onboarding\/preview$/, { timeout: 20_000 });
  await page.getByRole("button", { name: "Accept plan" }).click();
  await expect(page).toHaveURL(/\/patient\/today$/, { timeout: 20_000 });
  await page.reload();
  await expect(page.getByText("Today’s plan")).toBeVisible();
  await page.goto("/");
  await expect(page).toHaveURL(/\/patient\/today$/);
});
