import { expect, test } from "@playwright/test";
import { addDemoDays, currentDemoDate } from "../../lib/demo-date";

const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date(`${date}T12:00:00Z`));

test.beforeEach(async ({ request }) => {
  await request.post("/api/demo/settings", { data: { fixtureMode: true } });
});

test("completes the patient Daily Signal, delayed response, Stress Test, and acceptance path", async ({ page }) => {
  test.setTimeout(120_000);
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "INITIAL_PLAN_READY" } });
  await page.goto("/patient/today");
  await page.getByRole("link", { name: "Check in" }).click();
  await page.getByRole("button", { name: "Type" }).click();
  await page.getByLabel("Your update").fill("My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.");
  await page.getByRole("button", { name: /Review what CareLoad understood/ }).click();
  await expect(page).toHaveURL(/daily-signal\/review/);
  const durationAnswer = page.getByLabel(/How long has your stomach felt upset/);
  const activityAnswer = page.getByLabel(/Is this affecting your usual daily activities/);
  await expect(durationAnswer).toBeEnabled();
  await durationAnswer.selectOption({ label: "1–2 days" });
  await activityAnswer.selectOption({ label: "Yes" });
  await expect(page.getByRole("button", { name: "Review your answers" })).toBeEnabled();
  await page.getByRole("button", { name: "Review your answers" }).click();
  await page.getByRole("button", { name: /Yes, that’s right/ }).click();
  await page.getByRole("button", { name: "Send update" }).click();
  await expect(page).toHaveURL(/patient\/messages/);
  await expect(page.getByText(/Awaiting response/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Awaiting response/)).toBeVisible();
  await expect(page.getByText("Care Response Team", { exact: true })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("link", { name: /What this means for today/ }).click();
  await expect(page.getByRole("heading", { name: "What this means for today" })).toBeVisible();
  await page.getByRole("link", { name: /Back to Messages/ }).click();

  await page.request.post("/api/care-plan-changes/trigger");
  await page.goto("/patient/updates/demo-update");
  await expect(page.getByText("One morning and one evening blood-pressure reading each day for 14 days.")).toBeVisible();
  await page.getByRole("link", { name: "Preview dates and times" }).click();
  await expect(page).toHaveURL(/patient\/updates\/demo-update\/preview$/, { timeout: 20_000 });
  await expect(page.getByText("Every day", { exact: true })).toBeVisible();
  const startDate = currentDemoDate();
  await expect(page.getByText(`${formatDate(startDate)} to ${formatDate(addDemoDays(startDate, 13))}`)).toBeVisible();
  await expect(page.getByText("Before and after", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/needs review/)).toHaveCount(0);
  const acceptance = page.waitForResponse((response) =>
    response.url().includes("/api/care-plan-changes/") &&
    response.url().endsWith("/accept") &&
    response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Accept updated plan" }).click();
  expect((await acceptance).status()).toBe(200);
  await expect(page).toHaveURL(/patient\/today/, { timeout: 20_000 });
  await expect(page.getByText("Plan updated today")).toBeVisible();
  await page.goto("/patient/care-plan/task/bp-twice-daily-14-days");
  await expect(page.locator(".task-detail-card").getByText("Cardiology care-plan update", { exact: true })).toBeVisible();
});

test("fixture mode and persisted pending response survive navigation", async ({ page }) => {
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "DAILY_SIGNAL_SENT" } });
  await page.goto("/patient/messages");
  await expect(page.getByText(/Awaiting response/)).toBeVisible();
  await page.goto("/patient/today");
  await page.goto("/patient/messages");
  await expect(page.getByText(/Awaiting response/)).toBeVisible();
  await page.request.post("/api/demo/process-responses");
  await page.reload();
  await expect(page.getByText("Care Response Team", { exact: true })).toBeVisible();
});

test("collects a care-instruction question and keeps plan-update actions out of its reply", async ({ page }) => {
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "SIMULATION_READY" } });
  await page.goto("/patient/updates/demo-update");
  await page.getByRole("link", { name: "Ask a question" }).click();
  await expect(page).toHaveURL(/patient\/updates\/demo-update\/clarify$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Ask about this instruction" })).toBeVisible();
  const question = "How should I sit and position the cuff when taking a blood-pressure reading?";
  await page.getByLabel("What would you like to ask?").fill(question);
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page).toHaveURL(/patient\/messages\/thread-clarification/);
  await expect(page.getByText(question, { exact: true })).toBeVisible();
  await page.request.post("/api/demo/process-responses");
  await page.reload();
  await expect(page.getByText("Care Response Team", { exact: true })).toBeVisible();
  await expect(page.getByText(/sit quietly for five minutes/)).toBeVisible();
  await expect(page.getByRole("link", { name: /View your care-plan update/ })).toHaveCount(0);
});

test("records a minor Daily Signal without creating a message", async ({ page }) => {
  await page.request.post("/api/demo/checkpoint", { data: { checkpoint: "INITIAL_PLAN_READY" } });
  await page.goto("/patient/today");
  await page.getByRole("link", { name: "Check in" }).click();
  await page.getByRole("button", { name: "Type" }).click();
  await page.getByLabel("Your update").fill("I feel a little tired after a busy day, but I can do my usual activities and I do not need any support.");
  await page.getByRole("button", { name: /Review what CareLoad understood/ }).click();
  await page.getByLabel(/Is this affecting your usual daily activities/).selectOption("No");
  await page.getByLabel(/Would practical support help today/).selectOption("No");
  await page.getByRole("button", { name: "Review your answers" }).click();
  await page.getByRole("button", { name: /Yes, that’s right/ }).click();
  await expect(page.getByText("Saved to your Daily Signals")).toBeVisible();
  await expect(page.getByRole("button", { name: /Send anyway/ })).toBeVisible();
  await page.getByRole("button", { name: /Return to Today/ }).click();
  await expect(page).toHaveURL(/patient\/today/);
  await expect(page.getByText("Today’s optional check-in is complete.")).toBeVisible();
  await page.goto("/patient/messages");
  await expect(page.getByText("No messages yet")).toBeVisible();
});
