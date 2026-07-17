import { expect, test } from "@playwright/test";

test("completes the patient Daily Signal, delayed response, Stress Test, and acceptance path", async ({ page }) => {
  test.setTimeout(90_000);
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "INITIAL_PLAN_READY" } });
  await page.goto("/patient/today");
  await page.getByRole("link", { name: "Type" }).click();
  await page.getByRole("button", { name: "Type" }).click();
  await page.getByLabel("Your check-in").fill("My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.");
  await page.getByRole("button", { name: /Review what CareLoad understood/ }).click();
  await expect(page).toHaveURL(/daily-signal\/review/);
  const selects = page.locator("select");
  for (let index = 0; index < await selects.count(); index++) await selects.nth(index).selectOption({ index: 1 });
  await page.getByRole("button", { name: "Yes, that is right" }).click();
  await page.getByRole("button", { name: "Send update" }).click();
  await expect(page).toHaveURL(/patient\/messages/);
  await expect(page.getByText(/Awaiting fictional response/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Awaiting fictional response/)).toBeVisible();
  await expect(page.getByText("Simulated care-team response", { exact: true })).toBeVisible({ timeout: 20_000 });

  await page.request.post("/api/care-plan-changes/trigger");
  await page.goto("/patient/updates/demo-update");
  await expect(page.getByText("+28")).toBeVisible();
  await page.getByRole("link", { name: "Preview updated plan" }).click();
  await page.getByRole("button", { name: "Accept updated plan" }).click();
  await expect(page).toHaveURL(/patient\/today/);
  await expect(page.getByText("Plan updated today")).toBeVisible();
});

test("fixture mode and persisted pending response survive navigation", async ({ page }) => {
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "DAILY_SIGNAL_SENT" } });
  await page.goto("/patient/messages");
  await expect(page.getByText(/Awaiting fictional response/)).toBeVisible();
  await page.goto("/patient/today");
  await page.goto("/patient/messages");
  await expect(page.getByText(/Awaiting fictional response/)).toBeVisible();
  await page.request.post("/api/demo/process-responses");
  await page.reload();
  await expect(page.getByText("Simulated care-team response", { exact: true })).toBeVisible();
});
