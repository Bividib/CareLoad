import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/demo/settings", { data: { fixtureMode: true } });
});

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
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("School run start").fill("07:20");
  await page.getByRole("button", { name: "Add another routine" }).click();
  await page.getByLabel("Routine 5 name").fill("Lunch break");
  const saved = page.waitForResponse((response) => response.url().endsWith("/api/life-map") && response.request().method() === "PUT");
  await page.getByRole("button", { name: "Save changes" }).click();
  expect(pageErrors).toEqual([]);
  expect((await saved).status()).toBe(200);
  await expect(page).toHaveURL(/\/patient\/life-map\/preview$/, { timeout: 20_000 });
  await expect(page.getByText("Your active plan has not changed")).toBeVisible();
  await expect(page.getByText("Saturday", { exact: true })).toBeVisible();
  await expect(page.getByText("Sunday", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Accept updated plan" }).click();
  await expect(page).toHaveURL(/\/patient\/today$/, { timeout: 20_000 });
  await page.goto("/patient/life-map");
  await expect(page.getByLabel("School run start")).toHaveValue("07:20");
  await expect(page.locator('input[value="Lunch break"]')).toBeVisible();
});

test("offers only upload documents and talk-through onboarding sources", async ({ page }) => {
  await page.request.post("/api/demo/reset", { data: { confirmSyntheticReset: true } });
  await page.goto("/onboarding/build");
  await expect(page.getByRole("button", { name: /Upload documents/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Talk it through/ })).toBeVisible();
  await expect(page.getByText(/Connect health record/i)).toHaveCount(0);
  await page.getByRole("button", { name: /Talk it through/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/talk$/);
  await page.getByLabel("What should your plan fit around?").fill("i work weekday mornings");
  await page.getByRole("button", { name: "Save and return" }).click();
  await expect(page).toHaveURL(/\/onboarding\/build$/);
  await expect(page.getByRole("button", { name: /Talk it through/ })).toHaveClass(/complete/);
  await page.goto("/onboarding/life-map");
  await expect(page.getByLabel("Routine 1 name")).toHaveValue("Weekday morning work");
  await expect(page.getByLabel("Weekday morning work days")).toHaveValue("MON,TUE,WED,THU,FRI");
  await expect(page.getByLabel("Weekday morning work start")).toHaveValue("");
  await expect(page.getByLabel("Routine 1 name")).not.toHaveValue("School run");
});

test("completes functional onboarding with deterministic document extraction", async ({ page }) => {
  test.setTimeout(120_000);
  await page.request.post("/api/demo/reset", { data: { confirmSyntheticReset: true } });
  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding\/welcome$/);
  await page.getByLabel(/supports planning/i).check();
  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page).toHaveURL(/\/onboarding\/build$/);
  await page.getByRole("button", { name: /Upload documents/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/upload$/);
  await page.getByRole("button", { name: "Use all three sample documents" }).click();
  await expect(page.getByText("cardiology-discharge-summary.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Save documents and return" }).click();
  await expect(page).toHaveURL(/\/onboarding\/build$/);
  await expect(page.getByRole("button", { name: /Upload documents/ })).toContainText("Upload documents");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/onboarding\/processing$/);
  await page.getByRole("button", { name: "Start extraction" }).click();
  await expect(page).toHaveURL(/\/onboarding\/review$/, { timeout: 20_000 });
  await expect(page.locator(".compact-task")).toHaveCount(3);
  await page.getByRole("button", { name: /Looks right, continue/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/life-map$/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Looks right, build my plan" })).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name: "Looks right, build my plan" }).click();
  await expect(page).toHaveURL(/\/onboarding\/preview$/, { timeout: 20_000 });
  await page.getByRole("button", { name: "Accept plan" }).click();
  await expect(page).toHaveURL(/\/patient\/today$/, { timeout: 20_000 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Today’s plan", exact: true })).toBeVisible();
  await page.goto("/");
  await expect(page).toHaveURL(/\/patient\/today$/);
});
