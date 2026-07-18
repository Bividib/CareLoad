import { expect, test } from "@playwright/test";

test("completes the patient Daily Signal, delayed response, Stress Test, and acceptance path", async ({ page }) => {
  test.setTimeout(120_000);
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "INITIAL_PLAN_READY" } });
  await page.goto("/patient/today");
  await page.getByRole("link", { name: "Check in" }).click();
  await page.getByRole("button", { name: "Type" }).click();
  await page.getByLabel("Your check-in").fill("My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.");
  await page.getByRole("button", { name: /Review what CareLoad understood/ }).click();
  await expect(page).toHaveURL(/daily-signal\/review/);
  const selects = page.locator("select");
  for (let index = 0; index < await selects.count(); index++) await selects.nth(index).selectOption({ index: 1 });
  await page.getByRole("button", { name: /Yes, that’s right/ }).click();
  await page.getByRole("button", { name: "Send update" }).click();
  await expect(page).toHaveURL(/patient\/messages/);
  await expect(page.getByText(/Awaiting a care-team response/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Awaiting a care-team response/)).toBeVisible();
  await expect(page.getByText("Simulated care-team response", { exact: true })).toBeVisible({ timeout: 20_000 });

  await page.request.post("/api/care-plan-changes/trigger");
  await page.goto("/patient/updates/demo-update");
  await expect(page.getByText("+28")).toBeVisible();
  await page.getByRole("link", { name: "Preview updated plan" }).click();
  const acceptance = page.waitForResponse((response) =>
    response.url().includes("/api/care-plan-changes/") &&
    response.url().endsWith("/accept") &&
    response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Accept updated plan" }).click();
  expect((await acceptance).status()).toBe(200);
  await expect(page).toHaveURL(/patient\/today/, { timeout: 20_000 });
  await expect(page.getByText("Plan updated today")).toBeVisible();
});

test("fixture mode and persisted pending response survive navigation", async ({ page }) => {
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "DAILY_SIGNAL_SENT" } });
  await page.goto("/patient/messages");
  await expect(page.getByText(/Awaiting a care-team response/)).toBeVisible();
  await page.goto("/patient/today");
  await page.goto("/patient/messages");
  await expect(page.getByText(/Awaiting a care-team response/)).toBeVisible();
  await page.request.post("/api/demo/process-responses");
  await page.reload();
  await expect(page.getByText("Simulated care-team response", { exact: true })).toBeVisible();
});

test("records a minor Daily Signal without creating a message", async ({ page }) => {
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "INITIAL_PLAN_READY" } });
  await page.goto("/patient/today");
  await page.getByRole("link", { name: "Check in" }).click();
  await page.getByRole("button", { name: "Type" }).click();
  await page.getByLabel("Your check-in").fill("I feel a little tired after a busy day, but I can do my usual activities and I do not need any support.");
  await page.getByRole("button", { name: /Review what CareLoad understood/ }).click();
  await page.getByLabel("Is this affecting your usual daily activities?").selectOption("No");
  await page.getByLabel("Would practical support help today?").selectOption("No");
  await page.getByRole("button", { name: /Yes, that’s right/ }).click();
  await expect(page.getByText("Saved to your Daily Signals")).toBeVisible();
  await expect(page.getByRole("button", { name: /Send anyway/ })).toBeVisible();
  await page.getByRole("button", { name: /Return to Today/ }).click();
  await expect(page).toHaveURL(/patient\/today/);
  await expect(page.getByText("Today’s optional check-in is complete.")).toBeVisible();
  await page.goto("/patient/messages");
  await expect(page.getByText("No messages yet")).toBeVisible();
});
